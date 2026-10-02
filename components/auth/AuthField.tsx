import type { InputHTMLAttributes, ReactNode } from "react";
import { buttonClass } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Feedback";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode };

export function AuthField({ label, hint, ...inputProps }: AuthFieldProps) {
  return (
    <Field label={label} aside={hint}>
      <Input {...inputProps} />
    </Field>
  );
}

export function AuthAlert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return <Alert tone={tone}>{children}</Alert>;
}

export const authSubmitClassName = buttonClass({ size: "lg", className: "w-full" });
