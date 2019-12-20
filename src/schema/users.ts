import * as yup from "yup";

const signupSchema = yup.object().shape({
  forename: yup.string().required(),
  surname: yup.string().required(),
  password: yup.string().min(8).required(),
  email: yup.string().email().required(),
  phone: yup.string().notRequired(),
});

const loginSchema = yup.object().shape({
  password: yup.string().min(8).required(),
  email: yup.string().email().required(),
});

const getOneSchema = yup.object().shape({ id: yup.number().required() });

export type ISignupRequest = yup.InferType<typeof signupSchema>;
export type ILoginRequest = yup.InferType<typeof loginSchema>;
export type IGetOneRequest = yup.InferType<typeof getOneSchema>;
