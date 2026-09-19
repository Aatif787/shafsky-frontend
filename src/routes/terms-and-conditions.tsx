import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions | Shafsky Aviation Services Pvt. Ltd." },
      {
        name: "description",
        content:
          "Terms and Conditions of service for Shafsky Aviation Services Pvt. Ltd. (SUSWAGATAM) covering Meet and Greet, Lounge Services, booking, and airport conditions.",
      },
    ],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 font-sans max-w-2xl mx-auto">
            Shafsky Aviation Services Pvt. Ltd. (CIN: U63030DL2022PTC392831)
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <article className="prose prose-slate max-w-none text-[15px] sm:text-base leading-relaxed font-sans text-gray-700 space-y-6">
          <p>
            Shafsky Aviation Services Pvt. Ltd. (&ldquo;Shafsky Aviation&rdquo;) is the company incorporated under Companies Act 2013 with its operational office at 8/92, 2nd Floor, Mehram Nagar, Gate No 4, Near IGI Airport T1, New Delhi 110010, India and Certificate of Incorporation Number as <strong>U63030DL2022PTC392831</strong>. By continuing to booking of Shafsky Aviation Services, you accept the terms and conditions of services provided by Shafsky Aviation for its Services. These terms and conditions are applicable for all services provided by Shafsky Aviation including Meet and Greet services, Shafsky Aviation Lounge Services and all other services.
          </p>

          <p>
            Shafsky Aviation reserves the right to change these Terms and Conditions of Services at any time. The new version of the Terms and Conditions will be posted on this website and will take effect and govern all use of the website upon posting. Your use of this website indicates your agreement to be bounded by these Terms and Conditions of Services.
          </p>

          {/* Definitions */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Definitions
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>&ldquo;Sales Agent&rdquo;</strong>: Any entity authorised by Shafsky Aviation in writing on mutually agreed terms and conditions for undertaking bookings and reservations of Services on behalf of their client(s) in India and/or abroad.
            </li>
            <li>
              <strong>&ldquo;Service Add-on&rdquo;</strong>: Any service such as additional porter, bouquet, wheelchair, baby stroller, service upgrade, etc. that is offered by Shafsky Aviation for booking online on Website post the selection of base service by the Agent. Further, Service add-ons do not include Ancillary Services.
            </li>
          </ul>

          {/* Scope of Services */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Scope of Services
          </h2>
          <p>
            The scope of Services includes various services and packages broadly defined under following categories:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Departure Services:</strong> Assistance to Guests departing on International or Domestic flight from airport.</li>
            <li><strong>Arrival Services:</strong> Assistance to Guests arriving on International or Domestic flight at airport.</li>
            <li><strong>Transit Services:</strong> Assistance to Guests transiting through airport.</li>
            <li><strong>Lounge Services:</strong> Lounge access to Guests Travelling through the airport. For more information on Services please refer to Website.</li>
          </ul>

          {/* Online Booking */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Online Booking
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Agent must complete the Booking Process on the Website in advance for availing Services and confirmation of Services pursuant to all online and offline request by Agent(s) shall be subject to availability.</li>
            <li>Agent(s) shall use Online Reservations Engine to make booking for the Services.</li>
            <li>The bookings can be made by the Agent(s) for Service and packages made available online by Shafsky Aviation from time to time.</li>
            <li>Agent can book online for up to 10 Guests per booking. For group bookings (more than 10 guests) Agent(s) may contact Shafsky Aviation on contact details provided on the website.</li>
            <li>Agent is responsible for providing Shafsky Aviation with correct and legitimate detail(s) about itself and its Guest(s) during the Booking Process. Shafsky Aviation at all times shall reserve the right for taking any additional information in relation to the Agent(s) and/or Guest(s) during the process of online/offline booking or anytime during the performance of Services or any clarification thereafter.</li>
            <li>Any and/or all request(s) as may be received and acknowledged by Shafsky Aviation does not guarantee the Service by Shafsky Aviation and shall be subject to written confirmation by Shafsky Aviation.</li>
            <li>Shafsky Aviation reserves the right to accept or decline or cancel Agents request for Service without assigning any reasons.</li>
            <li>During the Booking Process the Agent(s) are requested to take extra care while providing information about guest(s), date and time of travel, contact numbers etc. Shafsky Aviation assumes no responsibility whatsoever on account of any problem that may arise on account of false/ erroneous information provided by Agent(s) to Shafsky Aviation or any delay or cancellation of flight or for any reason whatsoever including any major event, change in flight schedule, failure of Guest(s) to report at Airport on time.</li>
            <li>Once the Booking Process is completed, Agent can request for cancellation of Services in case of any change in plans and Shafsky Aviation shall initiate the refund process in line with the Cancellations and Refund Policy. However, the cancellation and refund to Client(s) of any Agent must be processed through the Agent only subject to the cancellation and refund policy.</li>
            <li>It is hereby clarified that during the process of booking by Online Reservation Engine on our website, if there is any &ldquo;transaction fee&rdquo; which is charged by the bank issuing the credit/debit card, such charges shall be paid by the Agent and Shafsky Aviation shall have no liability to pay such transaction fee.</li>
            <li>All Sales Agents shall deal with their clientele by themselves and Shafsky Aviation assume no responsibility of transaction between Sales Agent and its client. For all confirmed and legitimate Service(s) bookings by Sales Agent(s), Shafsky Aviation shall only be responsible for providing Service(s) to Guest(s), subject to the terms and conditions of Service at Airport.</li>
            <li><strong>Credit/Debit Card:</strong> Payment of online booking is accepted by all major credit/debit card (&ldquo;Card&rdquo;). In case the card used to transact online is issued in a country other than India there may be bank charges applicable and Shafsky Aviation shall not responsible for any charges that may be levied by the Card Issuing Bank. The Card payment is subject to authorization from the bank issuing the Card.</li>
            <li><strong>Net Banking:</strong> If the Agent has an account with any of the mentioned banks under the heading net banking on our website, then Agent can pay for the booking(s) securely through the respective bank&rsquo;s Internet banking option and the amount will be automatically debited from your account. Shafsky Aviation is not liable for any payment authorization, as the payment gateway is responsible only to hand over the information in an encrypted / secure format to the respective bank for authorizing the transaction. Any issue with payment authorization will need to be taken up with your respective bank. This facility is valid for all bookings made in Indian Rupees (INR) currency only.</li>
          </ul>

          {/* Condition of Service at the Airport */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Condition of Service at the Airport
          </h2>
          <p>
            Performance of Services to Guest(s) by Shafsky Aviation at the Airport shall be subject to following conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Guest shall identify himself/herself to the GSA or call on the number provided on Service confirmation voucher on arrival at Airport.</li>
            <li>
              <strong>Regulatory Compliance:</strong> Please note that no expedited service is permitted by the Bureau of Immigration and Indian Customs. All guests must abide by the rules and regulations of the respective airport, the Bureau of Immigration, and the Indian Customs authorities. We shall, under no circumstances, be liable or responsible for your actions or documentation, etc., if you are in violation of any rules and regulations, as applicable.
            </li>
            <li>Service by Shafsky Aviation to Guest(s) shall be subject to written confirmation of Service and satisfactory completion of necessary checks by relevant authorities including Security, Immigration, and Customs or such other authorities from whom the clearance is required by the Guest for travel through airport.</li>
            <li><strong>Duration of Service:</strong> The performance of Service will commence at the scheduled meeting time or the time of service as per the Service confirmation voucher. However, Shafsky Aviation at its sole discretion, may permit Guest(s) a window of 20 (twenty) minutes from the scheduled meeting time to avail the Service(s).</li>
            <li>In case of any failure of Guest(s) to report on time at the meeting point or the time of service as per the Service confirmation Voucher, she/he shall be deemed as a No Show and the Service will not be assured.</li>
            <li>For each unit of porter service, Baggage assistance will be provided to Guest(s) for up to 3 (three) units of check-in baggage. For the purpose of check-in baggage, the sum of the 3 (three) dimensions (length + breadth + height) must not exceed 62 (sixty-two) inches or 158 (one hundred fifty-eight) centimetres for each piece. Agents shall provide the requirement of porter service during the Booking Process. Shafsky Aviation may accept the additional requirement of porter services on payment of additional charges on the spot, subject to the availability.</li>
            <li>Shafsky Aviation shall at its sole discretion, be entitled to cancel, alter or omit any part of the Service with or without notification to Agent/Guest(s) at its sole discretion. In such cases, Shafsky Aviation&rsquo;s liability shall be limited to re-performance of the cancelled Service. In cases where Shafsky Aviation is unable to re-perform the service, partial/full refund may be provided by Shafsky Aviation to the Agent/Guest(s) at its sole discretion.</li>
            <li>Delays and cancellations of Service by Shafsky Aviation may result from factors beyond its control such as the accidents, governmental restrictions, and other events of force majeure, Shafsky Aviation&rsquo;s liability shall be limited to re-performance of the cancelled Service.</li>
            <li>Shafsky Aviation at all times shall reserve the right to withdraw the Service without assigning any reason and without further reference, in case the Agent/Guest(s) is / are in breach of any Terms &amp; Conditions of the Service.</li>
            <li>Agent/Guest shall not use the Service or its reference for any unlawful or prohibited purposes.</li>
            <li>Shafsky Aviation at its sole discretion may decline to provide Service in case of any misconduct or any unlawful or prohibited activity by the Agent/Guest(s).</li>
            <li>For all products and services provided by third parties (for example, limousine transfers, floral deliveries, hotels reservation or mobile sim card services etc.), the terms and conditions, cancellation and refund policies of such third party shall be applicable. Shafsky Aviation shall not be liable to Agent/Guest(s) regarding any product and service provided by any third party.</li>
            <li>Shafsky Aviation&rsquo;s liability, if any, shall in no event exceed the total charges paid by the Agent/Guest(s) for the Services. Under no circumstances, Shafsky Aviation shall be liable for any consequential, exemplary, special, indirect, incidental or punitive damages.</li>
            <li>Agent/Guest(s) agrees to indemnify Shafsky Aviation in respect to all claims, damages, losses, costs, and expenses (including legal expenses) which are awarded against or incurred by Shafsky Aviation as a direct result of acts or omissions by Agent/Guest(s) either during the course of booking and/or using the Service.</li>
            <li>Shafsky Aviation shall not be liable for the consequences of any delay or for any loss, cost or expense incurred by Agent/Guest(s) as a result of the actions of any other party including without limitation the Airline, Customs and Immigration Authorities etc.</li>
            <li>In relation to the Service, Shafsky Aviation accepts no liability for any items left or disclaimed by the Guest(s) during the course and after providing the Service. Further, in relation to Ancillary Services, Shafsky Aviation accepts no liability for any transaction executed by Agent and/or Guest with APBS and Shafsky Aviation shall be liable for any shortfalls including gap in actual service delivery and guests&rsquo; expectations, amount paid to APBS for availing services or performance of services by the final service provider.</li>
            <li>By offering Services, Shafsky Aviation does not accept any liability for damages, losses, or delays that may result on account of dealing with APBS or/and improper documents including without limitation possession of valid ticket, visa, passport or any other requirement in relation to entry, exit, length of stay, special permissions etc. as may be required for traveling through airport.</li>
          </ul>

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
