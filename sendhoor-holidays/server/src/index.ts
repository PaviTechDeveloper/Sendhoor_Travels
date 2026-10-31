import 'dotenv/config';
import express, { type Response } from 'express';
import { fileURLToPath } from 'node:url';
import type { ZodError } from 'zod';
import { bookingSchema, enquirySchema } from './schemas.js';
import { notifyOwner, type NotifyResult } from './notify.js';
import { createPackage, deletePackage, listPackages, packageSchema, updatePackage } from './packages.js';
import { login, requireOwner } from './auth.js';
import { removeUpload, saveImage, uploadsDir, UPLOAD_URL_PREFIX } from './uploads.js';
import { createVehicle, deleteVehicle, listVehicles, updateVehicle, vehicleSchema } from './vehicles.js';
import { blogSchema, createBlog, deleteBlog, listBlog, updateBlog } from './blog.js';

const app = express();
const clientDistDir = fileURLToPath(new URL('../../client/dist/', import.meta.url));
// Photo uploads arrive as base64 text, so they get a bigger limit than the forms.
app.use('/api/admin/uploads', express.json({ limit: '5mb' }));
// Blog posts can hold long paragraphs, so they get a bigger limit too.
app.use('/api/admin/blog', express.json({ limit: '200kb' }));
app.use(express.json({ limit: '16kb' }));
app.use(UPLOAD_URL_PREFIX, express.static(uploadsDir, { maxAge: '1y', immutable: true, fallthrough: false }));

function fieldErrors(error: ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    errors[key] ??= issue.message;
  }
  return errors;
}

function respond(res: Response, result: NotifyResult) {
  const channels = Object.values(result);
  // Only fail the request when nothing reached the owner.
  if (channels.every((status) => status !== 'sent')) {
    res.status(502).json({ ok: false, message: 'We could not send your request. Please call us on 8754610755.' });
    return;
  }
  res.json({ ok: true, channels: result });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/bookings', async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: fieldErrors(parsed.error) });
    return;
  }

  const booking = parsed.data;
  const result = await notifyOwner({
    subject: `New booking request from ${booking.name}`,
    replyTo: booking.email,
    text: [
      'New booking request from the website',
      '',
      `Name: ${booking.name}`,
      `Email: ${booking.email}`,
      `Phone: ${booking.phone}`,
      `Destination: ${booking.destination}`,
      `Start date: ${booking.startDate}`,
      `End date: ${booking.endDate}`,
      `Travelers: ${booking.travelers}`,
      `Special requests: ${booking.requests || 'None'}`,
    ].join('\n'),
    short: `Sendhoor booking: ${booking.name}, ${booking.phone}, ${booking.destination}, ${booking.startDate} to ${booking.endDate}, ${booking.travelers} travelers`,
  });
  respond(res, result);
});

app.post('/api/enquiries', async (req, res) => {
  const parsed = enquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: fieldErrors(parsed.error) });
    return;
  }

  const enquiry = parsed.data;
  const result = await notifyOwner({
    subject: `New enquiry from ${enquiry.name}`,
    replyTo: enquiry.email,
    text: [
      'New enquiry from the website',
      '',
      `Name: ${enquiry.name}`,
      `Email: ${enquiry.email}`,
      '',
      enquiry.message,
    ].join('\n'),
    short: `Sendhoor enquiry: ${enquiry.name}, ${enquiry.email}, ${enquiry.message.slice(0, 120)}`,
  });
  respond(res, result);
});

app.get('/api/packages', async (_req, res) => {
  res.json({ ok: true, packages: await listPackages() });
});

app.post('/api/admin/login', (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    res.status(503).json({ ok: false, message: 'Owner sign-in is not set up. Add ADMIN_PASSWORD to server/.env.' });
    return;
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const token = login(password);
  if (!token) {
    res.status(401).json({ ok: false, message: 'Wrong password.' });
    return;
  }
  res.json({ ok: true, token });
});

app.post('/api/admin/uploads', requireOwner, async (req, res) => {
  const result = await saveImage(typeof req.body?.image === 'string' ? req.body.image : '');
  if (!result.ok) {
    res.status(400).json({ ok: false, message: result.message });
    return;
  }
  res.json({ ok: true, url: result.url });
});

app.post('/api/admin/packages', requireOwner, async (req, res) => {
  const parsed = packageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: fieldErrors(parsed.error) });
    return;
  }
  res.status(201).json({ ok: true, package: await createPackage(parsed.data) });
});

app.put('/api/admin/packages/:id', requireOwner, async (req, res) => {
  const parsed = packageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: fieldErrors(parsed.error) });
    return;
  }

  const updated = await updatePackage(String(req.params.id), parsed.data);
  if (!updated) {
    res.status(404).json({ ok: false, message: 'Package not found.' });
    return;
  }
  res.json({ ok: true, package: updated });
});

app.delete('/api/admin/packages/:id', requireOwner, async (req, res) => {
  const removed = await deletePackage(String(req.params.id));
  if (!removed) {
    res.status(404).json({ ok: false, message: 'Package not found.' });
    return;
  }
  await removeUpload(removed.image);
  res.json({ ok: true });
});

app.get('/api/vehicles', async (_req, res) => {
  res.json({ ok: true, vehicles: await listVehicles() });
});

app.post('/api/admin/vehicles', requireOwner, async (req, res) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: fieldErrors(parsed.error) });
    return;
  }
  res.status(201).json({ ok: true, vehicle: await createVehicle(parsed.data) });
});

app.put('/api/admin/vehicles/:id', requireOwner, async (req, res) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: fieldErrors(parsed.error) });
    return;
  }

  const result = await updateVehicle(String(req.params.id), parsed.data);
  if (!result) {
    res.status(404).json({ ok: false, message: 'Vehicle not found.' });
    return;
  }

  // Photos that were removed from the vehicle are deleted from the server.
  const kept = new Set(result.updated.photos);
  await Promise.all(result.previousPhotos.filter((url) => !kept.has(url)).map(removeUpload));
  res.json({ ok: true, vehicle: result.updated });
});

app.delete('/api/admin/vehicles/:id', requireOwner, async (req, res) => {
  const removed = await deleteVehicle(String(req.params.id));
  if (!removed) {
    res.status(404).json({ ok: false, message: 'Vehicle not found.' });
    return;
  }
  await Promise.all(removed.photos.map(removeUpload));
  res.json({ ok: true });
});

app.get('/api/blog', async (_req, res) => {
  res.json({ ok: true, posts: await listBlog() });
});

app.post('/api/admin/blog', requireOwner, async (req, res) => {
  const parsed = blogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: fieldErrors(parsed.error) });
    return;
  }
  res.status(201).json({ ok: true, post: await createBlog(parsed.data) });
});

app.put('/api/admin/blog/:id', requireOwner, async (req, res) => {
  const parsed = blogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, errors: fieldErrors(parsed.error) });
    return;
  }

  const updated = await updateBlog(String(req.params.id), parsed.data);
  if (!updated) {
    res.status(404).json({ ok: false, message: 'Post not found.' });
    return;
  }
  res.json({ ok: true, post: updated });
});

app.delete('/api/admin/blog/:id', requireOwner, async (req, res) => {
  if (!(await deleteBlog(String(req.params.id)))) {
    res.status(404).json({ ok: false, message: 'Post not found.' });
    return;
  }
  res.json({ ok: true });
});

// In production the same Render service serves the built React app and API.
app.use(express.static(clientDistDir));
app.get(/^(?!\/api(?:\/|$)).*/, (_req, res, next) => {
  res.sendFile(fileURLToPath(new URL('../../client/dist/index.html', import.meta.url)), (error) => {
    if (error) next(error);
  });
});

const port = Number(process.env.PORT ?? 4100);
app.listen(port, () => {
  console.log(`Sendhoor API listening on http://localhost:${port}`);
});
