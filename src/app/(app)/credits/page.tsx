import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { CreditStoreTiers } from "./credit-store-tiers";

export default async function CreditsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_balance")
    .eq("id", user.id)
    .single();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <>
      <TopBar title="Credit Store" />
      <div className="p-6 md:p-10 max-w-3xl mx-auto w-full space-y-8">
        {/* Balance */}
        <Card className="bg-primary text-white border-none text-center">
          <p className="text-sm opacity-70 uppercase tracking-widest font-bold">
            Your Balance
          </p>
          <p className="text-4xl font-bold mt-2">
            {profile?.credits_balance ?? 0} Credits
          </p>
        </Card>

        {/* Purchase Tiers */}
        <CreditStoreTiers userId={user.id} />

        {/* Transaction History */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
            Transaction History
          </h3>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <Card key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {tx.description}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tx.amount > 0 ? "text-secondary" : "text-accent"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </span>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-sm text-text-secondary text-center py-4">
                No transactions yet
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
