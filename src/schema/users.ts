import * as yup from "yup";

export const signupSchema = yup.object().shape({
  forename: yup.string().required(),
  surname: yup.string().notRequired().nullable(),
  password: yup.string().min(8).required(),
  email: yup.string().email().required(),
  phone: yup.string().notRequired(),
});

export const loginSchema = yup.object().shape({
  password: yup.string().min(8).required(),
  email: yup.string().email().required(),
});

export const editSchema = yup.object().shape({
  forename: yup.string().notRequired(),
  surname: yup.string().notRequired(),
  phone: yup.string().notRequired(),
  optInMarketing: yup.boolean().notRequired(),
  email: yup.string().email().required(),
});

export const sendPasswordTokenSchema = yup.object().shape({
  email: yup.string().email().required(),
});

export const resetPasswordSchema = yup.object().shape({
  email: yup.string().email().required(),
  token: yup.string().min(16).required(),
});

const getOneSchema = yup.object().shape({ id: yup.number().required() });

export type ISignupRequest = yup.InferType<typeof signupSchema>;
export type ILoginRequest = yup.InferType<typeof loginSchema>;
export type IEditRequest = yup.InferType<typeof editSchema>;
export type IGetOneRequest = yup.InferType<typeof getOneSchema>;
