"use client";

import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
                <div className="mt-8 md:order-1 md:mt-0">
                    <p className="text-center text-xs leading-5 text-gray-500">
                        &copy; {new Date().getFullYear()} NIOS Prep. All rights reserved.
                    </p>
                </div>
                <div className="flex justify-center space-x-6 md:order-2">
                    {/* Social links or key navigation could go here */}
                    <Link href="/privacy" className="text-gray-400 hover:text-gray-500 text-sm">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-gray-400 hover:text-gray-500 text-sm">
                        Terms of Service
                    </Link>
                    <Link href="/contact" className="text-gray-400 hover:text-gray-500 text-sm">
                        Contact Support
                    </Link>
                </div>
            </div>
        </footer>
    );
}
