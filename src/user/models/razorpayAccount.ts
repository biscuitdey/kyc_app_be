export class RazorpayAccount {
  razorPayId: string;

  entity: string;

  fund_account: {
    id: string;

    entity: string;

    contact_id: string;

    account_type: string;

    bank_account: {
      name: string;
      bank_name: string;
      ifsc: string;
      account_number: string;
    };

    batch_id: string;

    active: boolean;

    created_at: number;
  };

  status: string;

  amount: number;

  currency: string;

  notes: {
    random_key_1: string;
    random_key_2: string;
  };

  results: {
    account_status: string;
    registered_name: string;
  };

  created_at: number;

  utr: string;
}
