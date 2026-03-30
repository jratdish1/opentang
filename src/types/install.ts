// OpenTang M5 — Shared install types

export interface InstallConfig {
  edition: string;
  packages: string[];
  network_mode: string;
  domain: string | null;
  email: string | null;
  llm_mode: string;
  llm_model: string | null;
  credentials: Record<string, Credential>;
  install_path: string;
}

export interface Credential {
  username: string;
  password: string;
}

export interface ProgressEvent {
  step_id: string;
  status: "active" | "done" | "error" | "log";
  message: string;
}

export interface ServiceStatus {
  name: string;
  status: "running" | "stopped" | "error";
  ports: string[];
}

export interface InstallStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done" | "error";
  message?: string;
}

export interface ServiceLink {
  id: string;
  name: string;
  port: number;
}
