import * as yup from "yup";

export const createSchema = yup.object().shape({
  username: yup.string().required(),
  password: yup.string().min(8).required(),
  email: yup.string().email().required(),
  isSuperAdmin: yup.boolean().required(),
  superAdmin: yup.string().email().required(),
});

export const deleteSchema = yup.object().shape({
  admin: yup.string().email().required()
});


export type ICreateRequest = yup.InferType<typeof createSchema>;
export type IDeleteRequest = yup.InferType<typeof deleteSchema>;
