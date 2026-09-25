import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { RichTextEditor } from "@/components/ui/RichTextEditor"

interface AppFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AppFormField({ label, error, required, id, name, ...props }: AppFormFieldProps) {
  const fieldId = id || name;
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input id={fieldId} name={name} required={required} className={error ? "border-destructive focus-visible:ring-destructive" : ""} {...props} />
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  )
}

interface AppFormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function AppFormTextarea({ label, error, required, id, name, ...props }: AppFormTextareaProps) {
  const fieldId = id || name;
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Textarea id={fieldId} name={name} required={required} className={error ? "border-destructive focus-visible:ring-destructive" : ""} {...props} />
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  )
}

interface AppFormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { label: string; value: string }[];
}

export function AppFormSelect({ label, error, required, id, name, options, ...props }: AppFormSelectProps) {
  const fieldId = id || name;
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select id={fieldId} name={name} required={required} className={error ? "border-destructive focus-visible:ring-destructive" : ""} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  )
}

interface AppFormRichTextProps {
  label: string;
  name: string;
  error?: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export function AppFormRichText({ label, error, required, id, name, placeholder, defaultValue }: AppFormRichTextProps) {
  const fieldId = id || name;
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={error ? "text-destructive" : ""}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <RichTextEditor id={fieldId} name={name} required={required} placeholder={placeholder} defaultValue={defaultValue} className={error ? "border-destructive" : ""} />
      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}
    </div>
  )
}
