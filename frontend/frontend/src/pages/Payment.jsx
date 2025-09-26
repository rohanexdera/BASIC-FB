import React, { useState } from "react";
import axios from "axios";

const SubscriptionPlans = () => {
  const [loading, setLoading] = useState(false);

  const subscribe = async (plan) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        "http://localhost:3000/api/subscription/create-subscription",
        {
          plan_id: plan.plan_id,
          plan_name: plan.plan_name,
          price: plan.price,
          cycle: plan.cycle,
          credits: plan.credits,
        },
        { withCredentials: true }
      );

      if (!data.success) {
        alert("Failed to create subscription");
        setLoading(false);
        return;
      }

      const subscription = data.subscription;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Your Company",
        description: plan.plan_name,
        handler: function (response) {
          alert("Subscription successful!");
          console.log("Payment success:", response);
        },
        prefill: {
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Error creating subscription");
    } finally {
      setLoading(false);
    }
  };

  // Example plans
  const plans = [
    { plan_id: "plan_R9byqBW2Y8nb8I", plan_name: "PRO", price: 49999, cycle: 12, credits: 10 },  // // HERE PRICE IS IN PAISE - 50000 PAISE = 500 INR
    { plan_id: "plan_R9bzJFAWdv5exo", plan_name: "PREMIUM", price: 49999, cycle: 12, credits: 50 },
  ];

  return (
    <div className="plans">
      <h2>Choose a Subscription Plan</h2>
      {plans.map((plan) => (
        <div key={plan.plan_id} className="plan">
          <h3>{plan.plan_name}</h3>
          <p>₹{plan.price / 100} per cycle</p>
          <p>{plan.credits} credits</p>
          <button disabled={loading} onClick={() => subscribe(plan)}>
            {loading ? "Processing..." : "Subscribe"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionPlans;
