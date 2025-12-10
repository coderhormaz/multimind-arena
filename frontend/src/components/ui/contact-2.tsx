import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Contact2Props {
  title?: string;
  description?: string;
  phone?: string;
  email?: string;
  web?: { label: string; url: string };
}

export const Contact2 = ({
  title = "Contact Us",
  description = "We are available for questions, feedback, or collaboration opportunities. Let us know how we can help!",
  phone = "(123) 456-7890",
  email = "contact@jhc.ai",
  web = { label: "jhc.ai", url: "https://jhc.ai" },
}: Contact2Props) => {
  return (
    <section className="py-32 bg-white">
      <div className="container">
        <div className="mx-auto flex max-w-screen-xl flex-col justify-between gap-10 lg:flex-row lg:gap-20">
          <div className="mx-auto flex max-w-sm flex-col justify-between gap-10">
            <div className="text-center lg:text-left">
              <h1 className="mb-2 text-5xl font-semibold text-gray-900 lg:mb-1 lg:text-6xl">
                {title}
              </h1>
              <p className="text-gray-600">{description}</p>
            </div>
            
          </div>
          <div className="mx-auto flex max-w-screen-md flex-col gap-6 rounded-lg border border-gray-200 bg-white p-10 shadow-sm">
            <div className="flex gap-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="firstname" className="text-gray-700">First Name</Label>
                <Input type="text" id="firstname" placeholder="First Name" className="border-gray-300 bg-white text-gray-900" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="lastname" className="text-gray-700">Last Name</Label>
                <Input type="text" id="lastname" placeholder="Last Name" className="border-gray-300 bg-white text-gray-900" />
              </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input type="email" id="email" placeholder="Email" className="border-gray-300 bg-white text-gray-900" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="subject" className="text-gray-700">Subject</Label>
              <Input type="text" id="subject" placeholder="Subject" className="border-gray-300 bg-white text-gray-900" />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message" className="text-gray-700">Message</Label>
              <Textarea placeholder="Type your message here." id="message" className="border-gray-300 bg-white text-gray-900" />
            </div>
            <Button className="w-full bg-gray-900 text-white hover:bg-gray-800">Send Message</Button>
          </div>
        </div>
      </div>
    </section>
  );
};
