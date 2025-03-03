declare module '@paystack/inline-js' {
  interface PaystackPop {
    newTransaction(config: {
      key: string;
      email: string;
      amount: number;
      ref?: string;
      onSuccess?: (response: { reference: string }) => void;
      onCancel?: () => void;
      [key: string]: any;
    }): void;
  }
  const PaystackPop: { new (): PaystackPop };
  export default PaystackPop;
}