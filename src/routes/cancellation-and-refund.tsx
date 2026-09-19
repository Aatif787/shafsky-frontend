import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cancellation-and-refund")({
  head: () => ({
    meta: [
      { title: "Cancellation and Refund Policy | Shafsky Aviation Services Pvt. Ltd." },
      {
        name: "description",
        content:
          "Cancellations and Refund policy applicable for Shafsky Aviation Meet and Greet Services across 10+ airports in India.",
      },
    ],
  }),
  component: CancellationAndRefundPage,
});

function CancellationAndRefundPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div
        className="relative w-full py-16 sm:py-20 lg:py-24 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(14,19,27,0.92), rgba(14,19,27,0.75)), url('/images/footer-plane-bg.webp')",
        }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-serif tracking-tight">
            Cancellation &amp; Refund Policy
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 font-sans max-w-2xl mx-auto">
            Shafsky Aviation Services Private Limited &mdash; Meet and Greet Services
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <article className="prose prose-slate max-w-none text-[15px] sm:text-base leading-relaxed font-sans text-gray-700">
          <p>
            Cancellations and Refund policy applicable for Shafsky Aviation Meet and Greet Services. We are operating in 10+ Airports in India. Airports we operate include: New Delhi IGI Airport, Mumbai, Ahmedabad, Guwahati, Mangalore, Jaipur, Lucknow, Thiruvananthapuram, Delhi, Goa, Hyderabad.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Cancellations &amp; Refund Policy Applicable for Meet and Greet Services
          </h2>
          <p>
            Customer(s) / Guest(s) if they wish to cancel their booking must:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Request for the cancellation of booked service using the &lsquo;Contact us&rsquo; tab provided on the Home Page of Website; or</li>
            <li>Notify in writing to Shafsky Aviation with the booking details and a reason for cancellation.</li>
          </ol>
          <p className="mt-4">
            Shafsky shall review such cancellation request(s) for its authenticity and once approved by Shafsky, the service booking will be cancelled and refund process will be initiated and necessary credit will be provided to the Facilitator subject to the deduction of applicable cancellation charges. Unless otherwise provided under specific service offerings from time to time, following charges (cancellation charges) shall be applicable:
          </p>

          {/* Table 1: Silver, Gold and Platinum Cancellation */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            1. For Silver, Gold and Platinum &mdash; Cancellation of Services
          </h2>
          <div className="overflow-x-auto my-6 border border-gray-200 rounded-lg shadow-xs">
            <table className="w-full text-left border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-[#0e131b] text-white">
                  <th className="p-3 sm:p-4 border-b border-gray-300 font-semibold">Timeline Prior to Scheduled Service</th>
                  <th className="p-3 sm:p-4 border-b border-gray-300 font-semibold">Cancellation Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">72 hours prior to the scheduled meeting time</td>
                  <td className="p-3 sm:p-4 font-medium text-red-600">2% of the Booking Amount</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">Between 72 to 48 hours prior to scheduled meeting time</td>
                  <td className="p-3 sm:p-4 font-medium text-red-600">8% of the Booking Amount</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">Between 48 to 24 hours prior to the scheduled meeting time</td>
                  <td className="p-3 sm:p-4 font-medium text-red-600">45% of the Booking Amount</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">Less than 24 hours prior to the service time</td>
                  <td className="p-3 sm:p-4 font-medium text-red-600">100% of the Booking Amount</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 2: Silver, Gold and Platinum Reschedule */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            2. For Silver, Gold and Platinum &mdash; Reschedule of Service
          </h2>
          <div className="overflow-x-auto my-6 border border-gray-200 rounded-lg shadow-xs">
            <table className="w-full text-left border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-[#0e131b] text-white">
                  <th className="p-3 sm:p-4 border-b border-gray-300 font-semibold">Timeline Prior to Service Time</th>
                  <th className="p-3 sm:p-4 border-b border-gray-300 font-semibold">Rescheduling Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">More than 24 hours prior to service time</td>
                  <td className="p-3 sm:p-4 font-medium text-green-700">No rescheduling charges (One time free)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">Within 12-24 hours to service time</td>
                  <td className="p-3 sm:p-4 font-medium text-amber-700">INR 600 (AI) per booking</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">Within 0-12 hours of service time</td>
                  <td className="p-3 sm:p-4 font-medium text-red-600">100% of the booking amount</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 3: Elite Customers Cancellation */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            3. For Elite Customers &mdash; Cancellation Charges
          </h2>
          <div className="overflow-x-auto my-6 border border-gray-200 rounded-lg shadow-xs">
            <table className="w-full text-left border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-[#0e131b] text-white">
                  <th className="p-3 sm:p-4 border-b border-gray-300 font-semibold">Timeline Prior to Service Time</th>
                  <th className="p-3 sm:p-4 border-b border-gray-300 font-semibold">Cancellation Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">More than 24 hours prior to the scheduled service time</td>
                  <td className="p-3 sm:p-4 font-medium text-green-700">Nil</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">Between 12-24 hours prior to the scheduled service time</td>
                  <td className="p-3 sm:p-4 font-medium text-amber-700">45% of the Booking Amount</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">Less than 12 hours prior to the scheduled service time</td>
                  <td className="p-3 sm:p-4 font-medium text-red-600">100% of the Booking Amount</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 4: Elite Customers Reschedule */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            4. For Elite Customers &mdash; Reschedule of Service
          </h2>
          <div className="overflow-x-auto my-6 border border-gray-200 rounded-lg shadow-xs">
            <table className="w-full text-left border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-[#0e131b] text-white">
                  <th className="p-3 sm:p-4 border-b border-gray-300 font-semibold">Service Option</th>
                  <th className="p-3 sm:p-4 border-b border-gray-300 font-semibold">Rescheduling Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">Unlimited rescheduling</td>
                  <td className="p-3 sm:p-4 font-medium text-green-700">No rescheduling charges</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="p-3 sm:p-4">Less than 12 hours prior to the scheduled service time</td>
                  <td className="p-3 sm:p-4 font-medium text-red-600">100% of the Booking Amount</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm italic text-gray-500">
            * Please note for any rescheduling in Elite Services, the same is subject to availability.
          </p>

          {/* Terms & Conditions */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Terms &amp; Conditions
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>For the purpose of calculating cancellation charges, Booking Amount shall mean the total amount (including taxes) paid by the Agent.</li>
            <li>3% bank charges would be applicable for all cancellation requests received 48 hours prior to service time.</li>
            <li>Surcharge of INR 500 (AI) shall be applicable for any booking requests received within 12 hours of service time.</li>
            <li>Shafsky Aviation shall endeavour to process refund if applicable, within 15 days from the date of cancellation and receipt of bank/credit card details.</li>
            <li>All rescheduling requests to be received at least 12 hours prior to service time for it to be considered as a valid request. All rescheduling requests shall be subject to availability.</li>
          </ul>

          <h3 className="text-lg font-bold text-[#0e131b] mt-6 mb-3 font-serif">
            No Refund Will Be Made in Case of the Following:
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-red-900 bg-red-50 p-4 rounded-md border border-red-200">
            <li>Wrong information about travel details of Guest(s) during the Booking Process.</li>
            <li>No Shows &ndash; If the passenger does not arrive at the meeting point within 30 minutes from the agreed arrival time.</li>
            <li>Booking amount paid for Service Add-ons.</li>
            <li>Delayed / missed / cancelled flights.</li>
            <li>Late arrival at the airport which results in denied check-in or boarding by the airlines.</li>
            <li>In case of any misconduct or any unlawful or prohibited activity by the Agent/Guest(s).</li>
            <li>In case Agent has availed promotional offers or discounts or cashback etc. during booking.</li>
          </ul>

          {/* Note */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Note
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>For the purpose of calculating cancellation charges, Booking Amount shall mean the total amount (Including taxes) paid by the Agent.</li>
            <li>Shafsky Aviation shall endeavour to process refund if applicable, within 15 days from the date of cancellation and receipt of bank/credit card details.</li>
            <li>In case of re-scheduling of services, the guest shall share the revised itinerary maximum within 48 hours from the time of rescheduling request. All rescheduling requests shall be subject to availability.</li>
          </ul>

          {/* General */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            General
          </h2>
          <div className="space-y-3">
            <p>
              The scope of Services includes various services and packages broadly defined under meet and greet categories.
            </p>
            <p>
              Shafsky Aviation reserves the right to amend, add to, change or remove any part of these Terms and Conditions at any time, without notice. Any changes to these Terms and Conditions or any terms posted on the website apply as soon as they are posted. By continuing to use the website after any changes are posted, you are indicating your acceptance of those changes.
            </p>
            <p>
              Shafsky Aviation shall not be liable for and shall be excluded from any liability, loss or damage of any kind incurred as a result of the use of the website or reliance on any information provided on the website or arising from the use of Shafsky Aviation services unless it is caused by the wilful misconduct or gross negligence of Shafsky Aviation.
            </p>
            <p>
              Shafsky Aviation may add, change, discontinue, remove or suspend any other content posted on the website, including features and specifications of products described or depicted on the website, temporarily or permanently, at any time, without notice and without liability.
            </p>
            <p>
              Shafsky Aviation reserves the right to undertake all necessary steps to ensure that the security, safety, and integrity of Shafsky Aviation systems as well as its client&rsquo;s interests are and remain, well-protected.
            </p>
            <p>
              Shafsky Aviation may take various steps to verify and confirm the authenticity, enforceability and validity of reservations placed by Agent(s).
            </p>
            <p>
              Shafsky Aviation in its sole and exclusive discretion, concludes that any reservation(s) is not or do not reasonably appear to be, authentic, enforceable, or valid, then Shafsky Aviation may cancel the said reservation any time before or during the Service.
            </p>
            <p>
              Any communications or materials to the website by electronic mail or otherwise, including any comments, data, questions, suggestions, or the like, all such communications as may be received by Shafsky Aviation will be treated by Shafsky Aviation as non-confidential.
            </p>
          </div>

          {/* Last updated */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              Last updated: September 2024
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
