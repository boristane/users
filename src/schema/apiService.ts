import * as yup from "yup";

export const apiServiceCreateSchema = yup.object().shape({
  name: yup.string().required(),
  expires: yup.date().required(),
});

export const apiServiceUpdateSchema = yup.object().shape({
  name: yup.string().notRequired(),
  expires: yup.date().notRequired(),
  active: yup.boolean().notRequired(),
});


export type IApiServiceCreateRequest = yup.InferType<typeof apiServiceCreateSchema>;
export type IApiServiceUpdateRequest = yup.InferType<typeof apiServiceUpdateSchema>;
