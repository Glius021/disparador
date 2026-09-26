import { useState } from "react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { submitLead } from "@/lib/lead";

const inputClass =
  "w-full border-b border-line bg-transparent pb-3 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors duration-300 focus:border-glow-cyan/70";

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <div className="mt-3">{children}</div>
    </label>
  );
}

// Máscara simples de telefone brasileiro: (11) 91234-5678
function formatWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function LeadForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Honeypot: preenchido apenas por bots.
    if (String(formData.get("website") ?? "") !== "") return;

    setStatus("sending");
    try {
      // A validação e o envio direto para a planilha (Apps Script) acontecem no servidor.
      await submitLead({
        data: {
          nome: formData.get("nome"),
          email: formData.get("email"),
          empresa: formData.get("empresa"),
          whatsapp: formData.get("whatsapp"),
          mensagem: formData.get("mensagem"),
        },
      });
      form.reset();
      setErrors([]);
      setStatus("done");
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      try {
        const parsed = JSON.parse(message) as { problems?: string[] };
        if (Array.isArray(parsed.problems)) {
          setErrors(parsed.problems);
          setStatus("idle");
          return;
        }
      } catch {
        /* erro de envio — segue para estado genérico */
      }
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="spotlight-card p-10 sm:p-14">
        <p className="eyebrow text-glow-cyan">Recebido</p>
        <h3 className="display mt-5 text-3xl text-foreground sm:text-4xl">
          Sua mensagem chegou até nós.
        </h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Um especialista da Immerse entra em contato em breve para entender o momento da sua
          operação e desenhar o próximo passo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      {/* Honeypot anti-spam — invisível para humanos */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>
          Não preencha este campo
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        <Field label="Nome">
          <input name="nome" className={inputClass} placeholder="Seu nome" maxLength={120} />
        </Field>
        <Field label="E-mail corporativo">
          <input
            name="email"
            type="email"
            className={inputClass}
            placeholder="voce@empresa.com"
            maxLength={160}
          />
        </Field>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        <Field label="Empresa">
          <input
            name="empresa"
            className={inputClass}
            placeholder="Nome da empresa"
            maxLength={120}
          />
        </Field>
        <Field label="WhatsApp">
          <input
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="(11) 91234-5678"
            maxLength={16}
            onChange={(e) => {
              e.currentTarget.value = formatWhatsApp(e.currentTarget.value);
            }}
          />
        </Field>
      </div>

      <Field label="Mensagem">
        <textarea
          name="mensagem"
          className={`${inputClass} min-h-24 resize-none`}
          placeholder="Conte brevemente o desafio que você quer resolver."
          maxLength={1500}
        />
      </Field>

      {errors.length > 0 && (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {errors.map((e) => (
            <li key={e}>— {e}</li>
          ))}
        </ul>
      )}

      {status === "error" && (
        <p className="text-sm text-muted-foreground">
          Não foi possível enviar agora. Tente novamente em instantes ou escreva para
          contato@assessoriaimmerse.com.br.
        </p>
      )}

      <div>
        <MagneticButton type="submit" disabled={status === "sending"}>
          {status === "sending" ? "ENVIANDO…" : "ENVIAR MENSAGEM"}
        </MagneticButton>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          🔒 Seus dados são tratados conforme a LGPD. Sem spam: você pode cancelar o contato a
          qualquer momento.
        </p>
      </div>
    </form>
  );
}
