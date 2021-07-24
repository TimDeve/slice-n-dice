import axios, { AxiosError, AxiosResponse } from "axios"

interface AxiosResponseError<T> extends AxiosError<T> {
  response: AxiosResponse<T>
}

export function isAxiosResponseError<T>(
  payload: any
): payload is AxiosResponseError<T> {
  if (!axios.isAxiosError(payload)) return false
  return !!payload?.response
}
