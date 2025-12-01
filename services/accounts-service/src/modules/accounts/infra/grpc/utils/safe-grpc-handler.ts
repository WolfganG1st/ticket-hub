import type { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';
import { mapErrorToGrpcStatus } from './grpc-error-mapper';

type GrpcHandler<Request, Response> = (
  call: ServerUnaryCall<Request, Response>,
  callback: sendUnaryData<Response>,
) => Promise<void>;

export function safeGrpcHandler<Request, Response>(
  handler: (call: ServerUnaryCall<Request, Response>) => Promise<Response>,
): GrpcHandler<Request, Response> {
  return async (call: ServerUnaryCall<Request, Response>, callback: sendUnaryData<Response>) => {
    try {
      const response = await handler(call);
      callback(null, response);
    } catch (error) {
      const serviceError = mapErrorToGrpcStatus(error);
      callback(serviceError);
    }
  };
}
