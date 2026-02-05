"use client";

import { useState } from "react";
import { z } from "zod";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(80, "Le nom ne peut pas dépasser 80 caractères."),
  email: z
    .string()
    .trim()
    .email("Veuillez saisir une adresse email valide."),
  subject: z
    .string()
    .trim()
    .min(2, "Le sujet doit contenir au moins 2 caractères.")
    .max(120, "Le sujet ne peut pas dépasser 120 caractères."),
  message: z
    .string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caractères.")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères."),
  consent: z.boolean().refine((value) => value, {
    message: "Merci de donner votre consentement.",
  }),
});

type ContactFormState = z.infer<typeof contactSchema>;

type FieldErrors = Partial<Record<keyof ContactFormState, string>>;

const defaultState: ContactFormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  consent: false,
};

export default function ContactForm() {
  const [formState, setFormState] = useState<ContactFormState>(defaultState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null,
  );

  const updateField = <K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setStatusType(null);

    const validation = contactSchema.safeParse(formState);
    if (!validation.success) {
      const fieldErrors: FieldErrors = {};
      validation.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ContactFormState | undefined;
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        setStatusType("error");
        setStatusMessage("Une erreur est survenue. Réessayez.");
        return;
      }

      setStatusType("success");
      setStatusMessage("Message envoyé.");
      setFormState(defaultState);
      setErrors({});
    } catch (error) {
      setStatusType("error");
      setStatusMessage("Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Nom
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={formState.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="input"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            required
          />
          {errors.name && (
            <span id="contact-name-error" className="text-xs text-rose-600">
              {errors.name}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="input"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            required
          />
          {errors.email && (
            <span id="contact-email-error" className="text-xs text-rose-600">
              {errors.email}
            </span>
          )}
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Sujet
        <input
          type="text"
          name="subject"
          value={formState.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          className="input"
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          required
        />
        {errors.subject && (
          <span id="contact-subject-error" className="text-xs text-rose-600">
            {errors.subject}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Message
        <textarea
          name="message"
          rows={5}
          value={formState.message}
          onChange={(event) => updateField("message", event.target.value)}
          className="input"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          required
        />
        {errors.message && (
          <span id="contact-message-error" className="text-xs text-rose-600">
            {errors.message}
          </span>
        )}
      </label>

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          name="consent"
          checked={formState.consent}
          onChange={(event) => updateField("consent", event.target.checked)}
          className="mt-1 h-4 w-4 accent-emerald-600"
          aria-invalid={Boolean(errors.consent)}
          aria-describedby={errors.consent ? "contact-consent-error" : undefined}
          required
        />
        <span>
          J’accepte que mes informations soient utilisées pour être recontacté.
        </span>
      </label>
      {errors.consent && (
        <span id="contact-consent-error" className="text-xs text-rose-600">
          {errors.consent}
        </span>
      )}

      {statusMessage && (
        <p
          className={`text-sm ${
            statusType === "success" ? "text-emerald-600" : "text-rose-600"
          }`}
          role="status"
        >
          {statusMessage}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Envoi…" : "Envoyer"}
        </button>
        <p className="text-xs text-slate-500">
          Nous répondons généralement sous 48h ouvrées.
        </p>
      </div>
    </form>
  );
}
