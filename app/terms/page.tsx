import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <p className="text-base font-semibold leading-7 text-indigo-600">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-700">
            **Effective Date:** January 28, 2026
          </p>
          <p className="mt-2 text-sm text-gray-500">
            **Website:** https://nios-prep.vercel.app/ ("we", "us", "our", "NIOS
            Prep", "the Service")
          </p>
        </div>

        <div className="prose prose-indigo max-w-none space-y-8">
          <p>
            Please read these Terms of Service ("Terms", "Agreement") carefully
            before using the website https://nios-prep.vercel.app/ or any
            related services (collectively, the "Service").
          </p>
          <p>
            By accessing or using the Service, you agree to be bound by these
            Terms. If you do not agree with any part of these Terms, you must
            not use the Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            1. Acceptance of Terms
          </h2>
          <p>
            These Terms constitute a legally binding agreement between you and
            the operator of NIOS Prep. You must be at least 13 years old (or the
            minimum age required in your country) to use the Service. By using
            the Service, you represent that you meet this age requirement.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            2. Description of the Service
          </h2>
          <p>
            NIOS Prep is a free educational platform that provides study
            materials, notes, practice questions, mock tests, and other
            resources intended to help students prepare for NIOS (National
            Institute of Open Schooling) examinations.
          </p>
          <p>
            <strong>
              The Service is provided "AS IS" and "AS AVAILABLE" without any
              warranty of any kind.
            </strong>
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            3. User Conduct
          </h2>
          <p>
            You agree <strong>not</strong> to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              Use the Service for any illegal purpose or in violation of any
              applicable law
            </li>
            <li>
              Copy, reproduce, distribute, modify, create derivative works from,
              publicly display, publicly perform, republish, download, store,
              license, sell, or transmit any part of the Service or its content
              without our prior written permission
            </li>
            <li>
              Attempt to gain unauthorized access to, interfere with, damage, or
              disrupt any parts of the Service, the server(s) on which the
              Service is hosted, or any server, computer, or database connected
              to the Service
            </li>
            <li>
              Use any robot, spider, scraper, or other automated means to access
              the Service for any purpose
            </li>
            <li>
              Introduce any viruses, trojan horses, worms, logic bombs, or other
              harmful material
            </li>
            <li>Harass, abuse, threaten, impersonate, or intimidate others</li>
            <li>
              Post or transmit any content that is obscene, offensive,
              defamatory, or otherwise objectionable
            </li>
            <li>
              Attempt to reverse engineer, decompile, disassemble, or otherwise
              attempt to discover the source code of the Service
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            4. Intellectual Property
          </h2>
          <p>
            All content on the Service (text, graphics, logos, icons, study
            materials, questions, explanations, layout, design, software, etc.)
            is owned by us or our licensors and is protected by copyright,
            trademark, and other intellectual property laws.
          </p>
          <p>
            You are granted a{' '}
            <strong>
              limited, non-exclusive, non-transferable, revocable license
            </strong>{' '}
            to access and use the Service and its content{' '}
            <strong>
              solely for your personal, non-commercial educational use
            </strong>{' '}
            while preparing for NIOS examinations.
          </p>
          <p>
            You may <strong>not</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              Download, save, or archive substantial portions of the content
            </li>
            <li>
              Use the content for commercial purposes (including coaching,
              tutoring services, content reselling, etc.)
            </li>
            <li>
              Distribute the content (even for free) on other websites, apps,
              Telegram channels, WhatsApp groups, etc.
            </li>
          </ul>
          <p className="mt-4">
            Any unauthorized use terminates the license granted herein.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            5. User-Generated Content (if applicable)
          </h2>
          <p>
            If the Service allows you to submit content (comments, questions,
            feedback, uploaded files, etc.), you grant us a worldwide,
            non-exclusive, royalty-free, perpetual, irrevocable, transferable
            license to use, reproduce, modify, adapt, publish, translate,
            distribute, and display such content in any form and medium.
          </p>
          <p>
            You represent that any content you submit does not infringe any
            third-party rights.
          </p>
          <p>
            We may remove or refuse to publish any user content at our sole
            discretion.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            6. Accuracy of Information
          </h2>
          <p>
            We make reasonable efforts to ensure the accuracy of study materials
            and questions. However:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              We do <strong>not</strong> guarantee that all information is
              completely accurate, up-to-date, or error-free
            </li>
            <li>
              The Service is <strong>not</strong> an official NIOS platform
            </li>
            <li>
              We are <strong>not</strong> affiliated with, endorsed by, or
              connected to the National Institute of Open Schooling (NIOS)
            </li>
            <li>
              Use of the Service does <strong>not</strong> guarantee passing any
              examination
            </li>
          </ul>
          <p className="mt-4">
            You are solely responsible for verifying important information with
            official NIOS sources.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            7. Third-Party Links & Resources
          </h2>
          <p>
            The Service may contain links to third-party websites or resources
            (YouTube videos, PDFs hosted elsewhere, etc.). We are not
            responsible for the content, privacy practices, or availability of
            these external sites.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            8. Disclaimer of Warranties
          </h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
            WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
            LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
            PURPOSE, NON-INFRINGEMENT, ACCURACY, RELIABILITY, OR AVAILABILITY.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            9. Limitation of Liability
          </h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR
            ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
            INTANGIBLE LOSSES, RESULTING FROM:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>YOUR USE OF OR INABILITY TO USE THE SERVICE</li>
            <li>ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS</li>
            <li>
              ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE
              SERVICE
            </li>
            <li>
              ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE THAT MAY BE
              TRANSMITTED THROUGH THE SERVICE
            </li>
            <li>ANY ERRORS OR OMISSIONS IN ANY CONTENT</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            10. Termination
          </h2>
          <p>
            We may terminate or suspend your access to the Service immediately,
            without prior notice or liability, for any reason, including breach
            of these Terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            11. Changes to the Terms
          </h2>
          <p>
            We may revise these Terms at any time. The updated version will be
            posted on this page with a revised "Effective Date".
            <br />
            Continued use of the Service after any changes constitutes
            acceptance of the new Terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            12. Governing Law
          </h2>
          <p>
            These Terms shall be governed by the laws of <strong>India</strong>,
            without regard to its conflict of law provisions.
          </p>
          <p>
            Any disputes arising from or relating to these Terms shall be
            subject to the exclusive jurisdiction of the courts located in{' '}
            <strong>Mumbai, Maharashtra, India</strong>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">
            13. Contact Us
          </h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <strong> support@neblify.com </strong>
          </p>

          <hr className="my-10 border-gray-200" />
          <p className="text-sm text-gray-500">
            Last updated: January 28, 2026
          </p>
        </div>
      </div>
    </div>
  );
}
