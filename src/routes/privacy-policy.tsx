import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Shafsky Aviation Services Pvt. Ltd." },
      {
        name: "description",
        content:
          "Privacy Policy of Shafsky Aviation Services Pvt. Ltd. (SUSWAGATAM). Learn how we collect, use, and protect your personal information.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 font-sans max-w-2xl mx-auto">
            Shafsky Aviation Services Private Limited
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <article className="prose prose-slate max-w-none text-[15px] sm:text-base leading-relaxed font-sans text-gray-700">
          {/* Introduction */}
          <p>
            This Privacy Policy by Shafsky Aviation Services Private Limited
            (Shafsky Aviation) sets out the policies and practices of which any
            information including personal data collected, processed, used, and
            retained by Shafsky Aviation for the purposes of its operation of
            provision of services and offering other services or products of
            Shafsky Aviation that may be of interest to our customers. Privacy of
            your information is of utmost importance to us. Shafsky Aviation
            takes the privacy of customers/guest information seriously. This
            privacy notice applies to information we collect about you in the
            different sections of the website. This privacy policy applies to the
            main website{" "}
            <a
              href="https://www.shafskyaviation.com"
              className="text-[#1a5632] hover:text-[#cca028] font-medium"
            >
              www.shafskyaviation.com
            </a>
            , as well as in the other domains and sub-domains owned and operated
            by the Shafsky Aviation.
          </p>

          <p>
            Shafsky Aviation can receive and store any information you enter on
            shafskyaviation.com or &ldquo;SUSWAGATAM&rdquo;.
            shafskyaviation.com (&ldquo;Website&rdquo;) or give us in any other
            way. This includes information that can identify you (&ldquo;personal
            information&rdquo;), including your first and last name, telephone
            number, postal and e-mail addresses, contact details and, in some
            cases, billing information (such as credit card number, cardholder
            name, and expiration date). We also may request information about
            your customer preferences, including meal requests, seat selection,
            frequent flyer/hotel/car rental program information, and ticketing
            options. You can choose not to provide information to us, but in
            general some information about you is required in order for you to
            register as a member; purchase products or services; complete a
            customer profile; participate in a survey or contest; ask us a
            question; or initiate other transactions on our website.
          </p>

          {/* Customer/Guest Information */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Customer/Guest Information
          </h2>
          <p>
            Shafsky Aviation may only collect Personal Data about an individual
            which it reasonably considers necessary for the relevant purposes
            underlying such processing. The following can form part of the
            Personal Data:
          </p>

          <h3 className="text-lg font-bold text-[#0e131b] mt-6 mb-3 font-serif">
            Demographic
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name</li>
            <li>Telephone number</li>
            <li>E-mail address</li>
            <li>
              Identity proof, if any as provided during booking stage
            </li>
            <li>
              Class of travel as provided during booking stage
            </li>
          </ul>

          <h3 className="text-lg font-bold text-[#0e131b] mt-6 mb-3 font-serif">
            Transaction Related
          </h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Transaction details and any other information which you have
              provided to us
            </li>
            <li>Data usage and platforms including traffic data</li>
            <li>Location data</li>
            <li>
              The originating domain name of your internet service provider
            </li>
            <li>Statistics on page</li>
            <li>Views cookies and IP addresses</li>
          </ul>

          {/* Information from Other Sources */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Information from Other Sources
          </h2>
          <p>
            We also may periodically obtain information about you from our
            business partners and other independent third-party sources and add
            it to our account information. Examples of information we may receive
            include: updated delivery and address information, which we use to
            correct our records and to facilitate proper delivery of services;
            and demographic information, which we use to better understand your
            potential purchasing preferences.
          </p>

          {/* Cookies */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Cookies and Other Web Technologies
          </h2>
          <p>
            When you visit the Website, we may assign your computer a
            &ldquo;cookie&rdquo; (a small, unique identifier text file). For
            example, whenever you sign in as a member, we record your member ID
            and the name on your member account in the cookie file on your
            computer. We also may record your password in this cookie file, if
            you checked the box entitled &ldquo;Save this password for automatic
            sign-in.&rdquo; Note that member IDs, passwords, and any other
            account-related data included in such cookies are encrypted for
            security purposes. You can always choose not to receive a cookie file
            by enabling your Web browser to refuse cookies or to prompt you
            before accepting a cookie. Please note that if you refuse to accept
            cookies from the Website, you may not be able to access many of the
            existing or future services as may be offered by the Website.
          </p>

          {/* Automatic Information */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Automatic Information
          </h2>
          <p>
            We automatically collect some information about your computer when
            you visit the Website. For example, we will collect your IP address,
            Web browser software (such as Netscape Navigator or Internet Explorer
            or Safari or Google Chrome etc.), and referring Website. We also may
            collect information about your online activity, such as Services
            package viewed and purchases made. One of our goals in collecting
            this automatic information is to help customize your user experience.
          </p>

          {/* Information Collected by Third Parties */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Information Collected by Third-Parties
          </h2>
          <p>
            We may provide links to third-party websites on the Platforms. Your
            use of such third-party websites will be subject to their privacy
            policies and is not covered by this Policy. We encourage you to read
            the privacy policies on the other websites you visit. As we cannot
            control or be responsible for the policies of other sites we may link
            to, or the use of any data you may share with them, you access these
            third-party websites at your own risk. The following can form part of
            the following third-party:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Partners who use our analytics services</li>
            <li>Advertisers</li>
            <li>
              Partners offering services as part of Shafsky Aviation Service
              offerings
            </li>
            <li>Vendors and service providers</li>
            <li>Researchers and academics</li>
            <li>Law enforcement or legal requests</li>
          </ul>

          {/* How we use your information */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            How We Use Your Information
          </h2>
          <p>
            If you are giving us your personal information in the course of
            registering or subscribing to a service or product at our website,
            then we will only use your information in order to provide you with
            that service or for closely related purposes. Your personal data is
            generally processed by us as necessary for purposes directly related
            to our functions and activities. Specifically, Data may be used by us
            for the following reasons:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Improvement of our products or services</li>
            <li>
              Transmission by email or any other form of communication of
              marketing materials to you
            </li>
            <li>
              Contact for survey or feedback which may be done using email or
              mail
            </li>
            <li>
              To enable our group entities to reach out to you in relation to
              their programmes managed by them / products or services offered by
              them
            </li>
            <li>
              To process your requests (such as replying to your queries)
            </li>
            <li>
              To execute other activities such as marketing campaign,
              promotional communications for which consent is taken
              appropriately
            </li>
            <li>Provision of Services, development and improvement</li>
            <li>
              Verification of identity for the purposes of processing and
              administering any membership application or registration
            </li>
            <li>Marketing messages and activities</li>
            <li>Conducting programmes and events</li>
            <li>To carry out profiling and statistical analysis</li>
            <li>
              Update on info about changes to programmes, policies, terms and
              conditions, Platform updates and other administrative information
            </li>
            <li>
              Prevention and detection of crime, fraud, risks, address security
              or technical issues
            </li>
            <li>
              To customise the Platforms and their content to particular
              preferences
            </li>
            <li>
              To conduct surveys, questionnaires and requests for feedback
            </li>
            <li>To respond to queries, requests, feedback and complaints</li>
            <li>
              To meet the requirements of any applicable laws/regulations,
              enforceable governmental request or court order
            </li>
            <li>
              To fulfil such other purpose as may be specified in a data
              protection and privacy notice given to you at the time your
              Personal Data is collected
            </li>
            <li>For the operations of Website and Newsletter</li>
          </ul>

          {/* With whom we share */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            With Whom We Share Your Information
          </h2>
          <p>
            In carrying out one or more of the purposes set out in above points
            of this Policy, we may need to disclose your Personal Data to one or
            more of the following third parties:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Agents</li>
            <li>
              Authorised service providers such as marketing partners and web
              analysis companies, and their business partners
            </li>
            <li>Auditors and professional advisors</li>
            <li>Business partners</li>
            <li>
              Entities authorised by Shafsky Aviation for booking of travel
              concierge or ancillary services
            </li>
            <li>Underwriters and insurers</li>
            <li>Law enforcement agencies</li>
            <li>
              Any person to whom disclosure is permitted or required by any
              applicable laws/regulations, enforceable governmental request or
              court order
            </li>
            <li>Any companies comprised in the group</li>
          </ul>

          {/* How you can access */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            How You Can Access Your Information
          </h2>
          <p>
            You can access your information at various points on the Website.
            These include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>The My Account pages</strong> (only for registered users)
              on the Website, where you can view, update, or change your personal
              information online subject to provision of such facility by Shafsky
              Aviation. On this page, you also can change your password; elect to
              have an automatic password sign-in when logging on to the Website;
              add new customers and delete existing customers from your member
              profile; update or correct names, phone numbers, and emergency
              contacts for customers associated with your profile; and update
              your travel preferences.
            </li>
            <li>
              <strong>The Manage My Bookings page</strong>, where you can view,
              and update your booking details.
            </li>
            <li>
              You can close your website account by selecting the{" "}
              <strong>Account Closure</strong> option. We will send you an e-mail
              confirming your request to close your account to the e-mail address
              contained in your member profile. Please note that after you close
              an account, you will not be able to sign in or access any of your
              personal information. However, you can open a new account at any
              time. Please also note that we may retain certain information
              associated with your account for analytical purposes as well as for
              record keeping integrity.
            </li>
          </ul>

          {/* Your choices */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Your Choices with Respect to Collection and Use of Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You can choose not to provide us with any information, although it
              may be needed to take advantage of certain features offered on the
              Website.
            </li>
            <li>
              You also can add or update information on the My Account and close
              your account as described above.
            </li>
            <li>
              The Help portion of the toolbar on most browsers will tell you how
              to prevent your browser from accepting new cookies, how to have the
              browser notify you when you receive a new cookie, or how to disable
              cookies altogether. Please note that if you refuse to accept
              cookies from the Website, you will not be able to access portions
              of our website.
            </li>
          </ul>

          {/* How we protect */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            How We Protect Your Information
          </h2>
          <p>
            We want you to feel confident about using the Website to undertake
            the booking of Services, so we are committed to protecting the
            information we collect. While no Website can guarantee cent percent
            security, we have implemented appropriate administrative, technical,
            and physical security procedures to help protect the personal
            information you provide to us. For example, only authorized employees
            are permitted to access personal information, and they only may do so
            for permitted business functions. In addition, we use encryption when
            transmitting your sensitive personal information between your system
            and ours, and we employ firewalls and intrusion detection systems to
            help prevent unauthorized persons from gaining access to your
            information. Our systems are configured with data encryption, or
            scrambling, technologies, and industry-standard firewalls. When you
            send personal information to the Website over the Internet, your data
            is protected by Secure Socket Layer (SSL) technology to ensure safe
            transmission.
          </p>

          {/* Data Retention */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Data Retention
          </h2>
          <p>
            We will cease to retain your Personal Data when the purposes for
            which we collected your Personal Data have ceased and/or when we are
            no longer required to continue retaining your Personal Data for any
            legal or business purposes.
          </p>

          {/* Changes */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e131b] mt-10 mb-4 font-serif">
            Changes to This Privacy Policy
          </h2>
          <p>
            Shafsky Aviation may update this Privacy Policy in the future. We
            will notify you about material changes to this Privacy Policy by
            sending a notice to the e-mail address you provided to us or by
            placing a prominent notice on our website.
          </p>

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
