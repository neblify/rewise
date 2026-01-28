"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { submitContactForm } from "@/app/actions/contact";

// Define initial state type
const initialState = {
    success: false,
    message: "",
    errors: {} as Record<string, string[]>,
};

export default function ContactPage() {
    const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

    return (
        <div className="bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
                <Link href="/" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Contact Us</h2>
                <p className="mt-2 text-lg leading-8 text-gray-600">
                    Have feedback, found an issue, or want to request a feature? We'd love to hear from you.
                </p>
            </div>

            <form action={formAction} className="mx-auto mt-16 max-w-xl sm:mt-20">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">

                    <div className="sm:col-span-2">
                        <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                            Email (Optional)
                        </label>
                        <div className="mt-2.5">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                autoComplete="email"
                                placeholder="you@example.com (if you want a reply)"
                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {state.errors?.email && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="subject" className="block text-sm font-semibold leading-6 text-gray-900">
                            Subject
                        </label>
                        <div className="mt-2.5">
                            <input
                                type="text"
                                name="subject"
                                id="subject"
                                placeholder="Feature Request / Bug Report"
                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {state.errors?.subject && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.subject[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-2.5">
                            <textarea
                                name="message"
                                id="message"
                                rows={4}
                                required
                                placeholder="Tell us what's on your mind..."
                                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            {state.errors?.message && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.message[0]}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    {state.success ? (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Send className="h-5 w-5 text-green-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">Submitted successfully</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>{state.message}</p>
                                    </div>
                                    <div className="mt-4">
                                        <Link href="/" className="text-sm font-medium text-green-800 hover:text-green-900 underline">
                                            Return Home
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={isPending}
                            className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Message"
                            )}
                        </button>
                    )}
                    {!state.success && state.message && (
                        <p className="mt-4 text-center text-sm text-red-600">{state.message}</p>
                    )}
                </div>
            </form>
        </div>
    );
}
