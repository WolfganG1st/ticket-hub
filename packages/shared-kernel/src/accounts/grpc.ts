export type GrpcUser = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ORGANIZER' | 'ADMIN';
};
