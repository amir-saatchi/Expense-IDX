"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface TransactionData {
  text: string;
  amount: number;
}

interface TransactionResult {
  data?: TransactionData;
  error?: string;
}

async function addTransaction(formData: FormData): Promise<TransactionResult> {
  const textValue = formData.get("text");
  const amountValue = formData.get("amount");

  // Check for input values
  if (!textValue || textValue === "" || !amountValue) {
    return { error: "Text or amount is missing" };
  }

  // ensure text is string and amount is number
  const text: string = textValue.toString();
  const amount: number = parseFloat(amountValue.toString());

  // Get logged in User
  const { userId } = auth();

  // Check for user
  if (!userId) {
    return { error: "User not found" };
  }

  try {
    const transactionData: TransactionData = await db.transaction.create({
      data: {
        text,
        amount,
        userId,
      },
    });
    revalidatePath("/");
    console.log(transactionData);
    return { data: transactionData };
  } catch (error) {
    return { error: "Transaction not added" };
  }
}

export default addTransaction;
