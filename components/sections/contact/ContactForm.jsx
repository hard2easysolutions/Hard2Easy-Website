"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { contactSchema } from "@/lib/contact-schema";
import SelectMenu from "./SelectMenu";
import SuccessDialog from "./SuccessDialog";

function Field({ id, label, error, multiline = false, register, ...props }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="relative">
      <Tag
        id={id}
        placeholder=" "
        aria-required="true"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`peer block w-full rounded-btn border bg-transparent px-4 pt-6 pb-2 text-[16px] text-fg transition-colors duration-200 outline-none focus:border-accent focus:ring-1 focus:ring-accent ${
          multiline ? "min-h-36 resize-y" : "h-14"
        } ${error ? "border-danger" : "border-line-strong hover:border-fg/40"}`}
        {...register}
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-2 left-4 origin-left text-[12px] text-mute transition-all duration-200 ease-quint peer-placeholder-shown:top-[1.05rem] peer-placeholder-shown:text-[16px] peer-focus:top-2 peer-focus:text-[12px] peer-focus:text-accent"
      >
        {label}
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-[13px] text-danger">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default function ContactForm({ copy }) {
  const [status, setStatus] = useState("idle"); // idle | sending | error
  const [sentName, setSentName] = useState(null); // first name while the popup is open

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", service: "", message: "", website: "" },
  });

  const onSubmit = async (data) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      reset();
      setStatus("idle");
      setSentName(data.name.trim().split(/\s+/)[0]);
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="-mt-4 pb-1 text-[14px] text-mute">{copy.requiredNote}</p>
        <Field id="cf-name" label={copy.fields.name} autoComplete="name" error={errors.name} register={register("name")} />
        <Field
          id="cf-email"
          type="email"
          inputMode="email"
          label={copy.fields.email}
          autoComplete="email"
          error={errors.email}
          register={register("email")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="cf-phone"
            type="tel"
            inputMode="tel"
            label={copy.fields.phone}
            autoComplete="tel"
            error={errors.phone}
            register={register("phone")}
          />
          <Controller
            name="service"
            control={control}
            render={({ field }) => (
              <SelectMenu
                id="cf-service"
                name={field.name}
                label={copy.fields.service}
                placeholder={copy.servicePlaceholder}
                options={copy.serviceOptions}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.service}
                fieldRef={field.ref}
              />
            )}
          />
        </div>
        <Field id="cf-message" multiline label={copy.fields.message} error={errors.message} register={register("message")} />

        {/* Honeypot — hidden from people and assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="cf-website">Website</label>
          <input id="cf-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-btn bg-green px-6 text-[15px] font-medium text-ink transition-colors duration-200 ease-quint hover:bg-lime disabled:opacity-80 sm:w-auto"
        >
          {status === "sending" ? (
            <>
              <Loader2 aria-hidden="true" strokeWidth={1.5} className="size-4 animate-spin" />
              <span>{copy.sending}</span>
            </>
          ) : (
            <>
              <span>{copy.submit}</span>
              <ArrowRight
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-4 transition-transform duration-200 ease-quint group-hover:translate-x-1"
              />
            </>
          )}
        </button>

        <p role="alert" className="min-h-5 text-[13px] text-danger">
          {status === "error" ? copy.errors.server : ""}
        </p>
      </form>
      {sentName !== null && <SuccessDialog name={sentName} copy={copy.popup} onClose={() => setSentName(null)} />}
    </>
  );
}
