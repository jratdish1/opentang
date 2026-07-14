import unittest
import json
import sqlite3
import os
from unittest.mock import patch, MagicMock

# Set mock env vars before importing
os.environ["NOVA_BOT_TOKEN"] = "TEST_TOKEN"
os.environ["WEBHOOK_SECRET_TOKEN"] = "TEST_SECRET"
os.environ["DB_PATH"] = "/tmp/test_nova.db"

from nova_stars_payment_handler import app, init_db, DB_PATH

class NovaPaymentTests(unittest.TestCase):
    
    def setUp(self):
        if os.path.exists("/tmp/test_nova.db"):
            os.remove("/tmp/test_nova.db")
            
        self.app = app.test_client()
        self.app.testing = True
        
        # Re-init DB for each test
        init_db()
        
        # Seed test data
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO sku_allowlist (sku_id, title, description, price_stars, media_url) VALUES ('test_sku', 'Test', 'Desc', 100, 'http://test')")
            cursor.execute("INSERT INTO allowed_groups (chat_id) VALUES (12345)")
            conn.commit()
            
        self.headers = {'X-Telegram-Bot-Api-Secret-Token': 'TEST_SECRET', 'Content-Type': 'application/json'}

    def test_health_check(self):
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.data)['status'], 'healthy')

    def test_webhook_auth_failure(self):
        response = self.app.post('/webhook', json={"update_id": 1})
        self.assertEqual(response.status_code, 401)

    def test_privacy_gate_allowed(self):
        payload = {
            "message": {
                "chat": {"id": 12345, "type": "group"},
                "text": "/terms"
            }
        }
        with patch('nova_stars_payment_handler.requests.post') as mock_post:
            response = self.app.post('/webhook', json=payload, headers=self.headers)
            self.assertEqual(response.status_code, 200)
            mock_post.assert_called_once()

    def test_privacy_gate_blocked(self):
        payload = {
            "message": {
                "chat": {"id": 99999, "type": "group"}, # Not in allowlist
                "text": "/terms"
            }
        }
        with patch('nova_stars_payment_handler.requests.post') as mock_post:
            response = self.app.post('/webhook', json=payload, headers=self.headers)
            self.assertEqual(response.status_code, 200)
            mock_post.assert_not_called()

    def test_pre_checkout_invalid_order(self):
        payload = {
            "pre_checkout_query": {
                "id": "query_1",
                "invoice_payload": "nonexistent_order"
            }
        }
        with patch('nova_stars_payment_handler.requests.post') as mock_post:
            response = self.app.post('/webhook', json=payload, headers=self.headers)
            self.assertEqual(response.status_code, 200)
            
            # Verify answerPreCheckoutQuery was called with ok=False
            call_args = mock_post.call_args[1]['json']
            self.assertFalse(call_args['ok'])

    def test_pre_checkout_valid_order(self):
        # Seed a pending order
        with sqlite3.connect(DB_PATH) as conn:
            conn.cursor().execute("INSERT INTO orders (internal_order_id, telegram_user_id, chat_id, sku_id, amount, state, payload) VALUES ('order_1', 1, 1, 'test_sku', 100, 'PENDING', 'order_1')")
            conn.commit()

        payload = {
            "pre_checkout_query": {
                "id": "query_1",
                "invoice_payload": "order_1"
            }
        }
        with patch('nova_stars_payment_handler.requests.post') as mock_post:
            response = self.app.post('/webhook', json=payload, headers=self.headers)
            self.assertEqual(response.status_code, 200)
            
            # Verify answerPreCheckoutQuery was called with ok=True
            call_args = mock_post.call_args[1]['json']
            self.assertTrue(call_args['ok'])
            
            # Verify state transition
            with sqlite3.connect(DB_PATH) as conn:
                state = conn.cursor().execute("SELECT state FROM orders WHERE internal_order_id = 'order_1'").fetchone()[0]
                self.assertEqual(state, "APPROVED_PENDING_CHARGE")

    def test_successful_payment_delivery(self):
        # Seed an approved order
        with sqlite3.connect(DB_PATH) as conn:
            conn.cursor().execute("INSERT INTO orders (internal_order_id, telegram_user_id, chat_id, sku_id, amount, state, payload) VALUES ('order_2', 1, 1, 'test_sku', 100, 'APPROVED_PENDING_CHARGE', 'order_2')")
            conn.commit()

        payload = {
            "message": {
                "chat": {"id": 1, "type": "private"},
                "successful_payment": {
                    "currency": "XTR",
                    "total_amount": 100,
                    "invoice_payload": "order_2",
                    "telegram_payment_charge_id": "tg_123",
                    "provider_payment_charge_id": "prov_123"
                }
            }
        }
        
        with patch('nova_stars_payment_handler.requests.post') as mock_post:
            response = self.app.post('/webhook', json=payload, headers=self.headers)
            self.assertEqual(response.status_code, 200)
            
            # Verify delivery message was sent
            mock_post.assert_called_once()
            call_args = mock_post.call_args[1]['json']
            self.assertIn("http://test", call_args['text'])
            
            # Verify state transition to FULFILLED
            with sqlite3.connect(DB_PATH) as conn:
                state = conn.cursor().execute("SELECT state FROM orders WHERE internal_order_id = 'order_2'").fetchone()[0]
                self.assertEqual(state, "FULFILLED")

    def test_successful_payment_wrong_currency(self):
        payload = {
            "message": {
                "chat": {"id": 1, "type": "private"},
                "successful_payment": {
                    "currency": "USD", # Invalid
                    "total_amount": 100,
                    "invoice_payload": "order_3",
                    "telegram_payment_charge_id": "tg_123",
                    "provider_payment_charge_id": "prov_123"
                }
            }
        }
        
        with patch('nova_stars_payment_handler.requests.post') as mock_post:
            response = self.app.post('/webhook', json=payload, headers=self.headers)
            self.assertEqual(response.status_code, 200)
            mock_post.assert_not_called()

if __name__ == '__main__':
    unittest.main()
