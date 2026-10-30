import { useState, type FormEvent } from 'react';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import FormField, { inputClass } from '../forms/FormField';
import { contactSchema } from '../../features/contact/schemas';
import { submitForm } from '../../lib/api';

type ContactErrors = Partial<Record<'name' | 'email' | 'message', string>>;

export default function ContactSection() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const result = contactSchema.safeParse({
      name: data.get('name'),
      email: data.get('email'),
      message: data.get('message'),
    });

    if (!result.success) {
      const nextErrors: ContactErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ContactErrors;
        nextErrors[key] ??= issue.message;
      }
      setErrors(nextErrors);
      setSent(false);
      return;
    }

    setErrors({});
    setSendError(null);
    setSending(true);
    const response = await submitForm('/api/enquiries', result.data);
    setSending(false);

    if (!response.ok) {
      setSendError(response.message ?? 'Something went wrong. Please try again.');
      setSent(false);
      return;
    }

    setSent(true);
    form.reset();
  };

  return (
    <section id="contact" className="scroll-mt-24 bg-white py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionHeading
            align="left"
            eyebrow="Contact"
            title="Talk to a travel advisor"
            subtitle="Questions before you book? Send us a message and we will reply within one business day."
          />
          <ul className="mt-10 space-y-5 text-ink/80">
            <li className="flex gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />Rakkiyapalayam, Ammapalayam, Avinashi, Tiruppur - 641652</li>
            <li className="flex gap-3"><Phone className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden /><span>
  <a href="tel:+918754610755" className="transition hover:text-brand">8754610755</a>
  {' / '}
  <a href="tel:+917397394833" className="transition hover:text-brand">7397394833</a>
</span></li>
            <li className="flex gap-3"><Mail className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden /><a href="mailto:sendhoorholidays2004@gmail.com" className="transition hover:text-brand">sendhoorholidays2004@gmail.com</a></li>
            <li className="flex gap-3"><Instagram className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden /><a href="https://www.instagram.com/sendhoor_holidays_/" target="_blank" rel="noreferrer" className="transition hover:text-brand">@sendhoor_holidays_</a></li>
          </ul>
        </div>

        <form noValidate onSubmit={handleSubmit} className="grid gap-5 rounded-3xl bg-sand p-6 md:p-8 lg:col-span-3">
          <FormField id="contact-name" label="Name" error={errors.name}>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              className={inputClass}
            />
          </FormField>

          <FormField id="contact-email" label="Email" error={errors.email}>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
              className={inputClass}
            />
          </FormField>

          <FormField id="contact-message" label="Message" error={errors.message}>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
              className={`${inputClass} h-auto py-3`}
            />
          </FormField>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p role="status" aria-live="polite" className={`text-sm ${sendError ? 'text-coral' : 'text-brand'}`}>
              {sendError ?? (sent ? 'Thanks! We have received your message.' : '')}
            </p>
            <Button type="submit" variant="primary" disabled={sending} className="sm:w-auto">
              {sending ? 'Sending...' : 'Send message'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
