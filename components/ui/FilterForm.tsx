"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny } from "zod";

import { cn } from "@/lib/utils";
import type { FieldConfig, FieldOption } from "@/types/filterForm";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterFormProps<T extends FieldValues> {
  fields: FieldConfig[];
  defaultValues: T;
  schema?: ZodTypeAny;
  onSearch: (values: T) => void;
  className?: string;
}

export function FilterForm<T extends FieldValues>({
  fields,
  defaultValues,
  schema,
  onSearch,
  className,
}: FilterFormProps<T>) {
  const form = useForm<T>({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, FieldOption[]>
  >({});

  useEffect(() => {
    fields.forEach((f) => {
      if (f.optionsEndpoint) {
        fetch(f.optionsEndpoint)
          .then((res) => res.json())
          .then((data: { options: FieldOption[] }) => {
            setDynamicOptions((prev) => ({
              ...prev,
              [f.name]: data.options ?? [],
            }));
          });
      }
    });
  }, [fields]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSearch)}
        className={cn(
          "flex flex-wrap gap-4 items-end bg-white p-4 rounded shadow",
          className
        )}>
        {fields.map((f) => {
          const options = f.optionsEndpoint
            ? dynamicOptions[f.name] || []
            : f.options || [];

          return (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {f.label}
                    {f.required && <span className="text-red-500">*</span>}
                  </FormLabel>

                  {["text", "date", "select"].includes(f.type) && (
                    <FormControl>
                      {f.type === "text" ? (
                        <Input
                          {...field}
                          placeholder={f.placeholder}
                          disabled={f.disabled}
                        />
                      ) : f.type === "date" ? (
                        <Input type="date" {...field} disabled={f.disabled} />
                      ) : (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={f.disabled}>
                          <SelectTrigger className="w-36">
                            <SelectValue
                              placeholder={f.placeholder || "선택"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={String(opt.value)}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}

        <Button type="submit">조회</Button>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          초기화
        </Button>
      </form>
    </Form>
  );
}
