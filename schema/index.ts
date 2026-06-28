import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .min(8, "Password must be at least 8 characters.");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const signupFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupFormInput = z.infer<typeof signupFormSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// API payload for completing a reset (token from the emailed link + new password).
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  password: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Client form on /reset-password (adds the confirm-password match).
export const resetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: emailSchema,
  subject: z.string().min(1, "Subject is required."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;

const orderItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  image: z.string().min(1),
  unit: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().int().positive(),
});

const orderCustomerSchema = z.object({
  name: z.string().trim().min(1, "Full name is required."),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,}$/, "Please enter a valid phone number (at least 10 digits)."),
  city: z.string().trim().min(1, "City is required."),
  area: z.string().trim().min(1, "Area is required."),
  address: z.string().trim().min(1, "Address is required."),
});

// Server recomputes subtotal/shipping/total from items — never trust the
// client for money — so the request only carries items, payment, and customer.
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Your cart is empty."),
  payment: z.enum(["cod", "online"]),
  customer: orderCustomerSchema,
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const createRiderSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: emailSchema,
  password: passwordSchema,
});

export type CreateRiderInput = z.infer<typeof createRiderSchema>;

// Admin action on an order: assign a rider (pending|assigned) or cancel (pending|assigned).
export const assignOrderSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("assign"),
    riderId: z.string().min(1, "A rider must be selected."),
  }),
  z.object({ action: z.literal("cancel") }),
]);

export type AssignOrderInput = z.infer<typeof assignOrderSchema>;

export const orderStatusEnum = z.enum([
  "pending",
  "assigned",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const orderStatusQuerySchema = z.object({
  status: orderStatusEnum.optional(),
});

// Rider advances their own order: assigned → out_for_delivery → delivered.
export const riderOrderUpdateSchema = z.object({
  status: z.enum(["out_for_delivery", "delivered"]),
});

export type RiderOrderUpdateInput = z.infer<typeof riderOrderUpdateSchema>;
