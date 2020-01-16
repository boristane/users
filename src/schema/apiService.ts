import * as yup from "yup";

export const apiServiceCreateSchema = yup.object().shape({
  name: yup.string().required(),
  expires: yup.string().required(),
});

export const apiServiceUpdateSchema = yup.object().shape({
  active: yup.boolean().required(),
});


export type IApiServiceCreateRequest = yup.InferType<typeof apiServiceCreateSchema>;
export type IApiServiceUpdateRequest = yup.InferType<typeof apiServiceUpdateSchema>;
