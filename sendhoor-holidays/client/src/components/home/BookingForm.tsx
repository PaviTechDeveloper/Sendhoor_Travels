import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import FormField, { inputClass } from '../forms/FormField';
import { bookingRequestSchema } from '../../features/bookings/schemas';
import { destinations } from '../../lib/siteContent';
import { submitForm } from '../../lib/api';

const emptyValues = {
  name: '',
  email: '',
  phone: '',
  destination: '',
  startDate: '',
  endDate: '',
  travelers: '2',
  requests: '',
};

type FormValues = typeof emptyValues;
type FormErrors = Partial<Record<keyof FormValues, string>>;

export default function BookingForm() {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = bookingRequestSchema.safeParse(values);

    if (!result.success) {
      const nextErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        nextErrors[key] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSendError(null);
    setSending(true);
    const response = await submitForm('/api/bookings', result.data);
    setSending(false);

    if (!response.ok) {
      setSendError(response.message ?? 'Something went wrong. Please try again.');
      return;
    }

    setSubmittedName(result.data.name);
    setValues(emptyValues);
  };

  const fieldProps = (name: keyof FormValues) => ({
    id: `book-${name}`,
    name,
    value: values[name],
    onChange: handleChange,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `book-${name}-error` : undefined,
    className: inputClass,
  });

  return (
    <section id="book" className="scroll-mt-24 bg-sand py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Book a trip"
            title="Tell us your dream trip"
            subtitle="Share a few details and an advisor will send you a personalized quote within 24 hours."
          />
          <ul className="mt-8 space-y-3 text-sm text-ink/80">
            <li className="flex gap-2"><CheckCircle2 className="size-5 shrink-0 text-brand" aria-hidden />No payment needed to request a quote</li>
            <li className="flex gap-2"><CheckCircle2 className="size-5 shrink-0 text-brand" aria-hidden />Fully customizable dates, hotels and activities</li>
            <li className="flex gap-2"><CheckCircle2 className="size-5 shrink-0 text-brand" aria-hidden />Your details are used only to plan your trip</li>
          </ul>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-ink/5 sm:grid-cols-2 md:p-8"
        >
          <FormField id="book-name" label="Full name" error={errors.name}>
            <input type="text" autoComplete="name" placeholder="Your name" {...fieldProps('name')} />
          </FormField>

          <FormField id="book-email" label="Email" error={errors.email}>
            <input type="email" autoComplete="email" placeholder="you@example.com" {...fieldProps('email')} />
          </FormField>

          <FormField id="book-phone" label="Phone" error={errors.phone}>
            <input type="tel" autoComplete="tel" placeholder="+91 00000 00000" {...fieldProps('phone')} />
          </FormField>

          <FormField id="book-destination" label="Destination" error={errors.destination}>
            <select {...fieldProps('destination')}>
              <option value="">Select a destination</option>
              {destinations.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
              <option value="Not sure yet">Not sure yet</option>
            </select>
          </FormField>

          <FormField id="book-startDate" label="Start date" error={errors.startDate}>
            <input type="date" {...fieldProps('startDate')} />
          </FormField>

          <FormField id="book-endDate" label="End date" error={errors.endDate}>
            <input type="date" {...fieldProps('endDate')} />
          </FormField>

          <FormField id="book-travelers" label="Travelers" error={errors.travelers}>
            <input type="number" min={1} max={50} inputMode="numeric" {...fieldProps('travelers')} />
          </FormField>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <FormField id="book-requests" label="Special requests (optional)" error={errors.requests}>
              <textarea
                rows={4}
                placeholder="Honeymoon, accessibility needs, dietary preferences, budget..."
                {...fieldProps('requests')}
                className={`${inputClass} h-auto py-3`}
              />
            </FormField>
          </div>

          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p role="status" aria-live="polite" className={`text-sm ${sendError ? 'text-coral' : 'text-brand'}`}>
              {sendError ?? (submittedName ? `Thanks, ${submittedName}! Our advisors will contact you within 24 hours.` : '')}
            </p>
            <Button type="submit" disabled={sending} className="sm:w-auto">
              {sending ? 'Sending...' : 'Request a quote'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
