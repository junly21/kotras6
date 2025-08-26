"use client";

import { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useForm, type FieldValues } from "react-hook-form";
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
import { ComboBox } from "@/components/ui/ComboBox";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FilterFormProps<T extends FieldValues> {
  fields: FieldConfig[];
  defaultValues: T;
  schema?: ZodTypeAny;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSearch: (values: any) => void;
  className?: string;
  // 컨트롤드 패턴 지원
  values?: T;
  onChange?: (values: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FilterForm<T extends FieldValues>({
  fields,
  defaultValues,
  schema,
  onSearch,
  className,
  values,
  onChange,
}: FilterFormProps<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, FieldOption[]>
  >({});

  // 컨트롤드 패턴: 외부 values가 바뀌면 내부 폼 값도 동기화
  useEffect(() => {
    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        form.setValue(key, value);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values && JSON.stringify(values)]);

  // 컨트롤드 패턴: 내부 값이 바뀌면 onChange 호출
  useEffect(() => {
    if (onChange) {
      const subscription = form.watch((allValues) => {
        onChange(allValues as T);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onChange]);

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
          "flex flex-wrap gap-4 items-center bg-[#E9E9E9] border border-[#D9D9D9] p-4 rounded-xl",
          className
        )}>
        {fields.map((f) => {
          let options = f.optionsEndpoint
            ? dynamicOptions[f.name] || []
            : f.options || [];

          // filterOptions가 있으면 적용
          if (f.filterOptions) {
            options = f.filterOptions(options);
          }

          return (
            <FormField
              key={f.name}
              control={form.control}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name={f.name as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {f.label}
                    {f.required && <span className="text-red-500">*</span>}
                  </FormLabel>

                  {f.type === "combobox" ? (
                    <FormControl>
                      <ComboBox
                        options={options}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={f.placeholder}
                        disabled={f.disabled}
                      />
                    </FormControl>
                  ) : (
                    ["text", "date", "select"].includes(f.type) && (
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
                            <SelectTrigger className="min-w-[200px] bg-white border border-[#d9d9d9]">
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
                    )
                  )}
                </FormItem>
              )}
            />
          );
        })}

        <Button type="submit" className="rounded-lg">
          조회
        </Button>
        {/* <Button
          type="button"
          className="rounded-lg"
          variant="outline"
          onClick={() => form.reset()}>
          초기화
        </Button> */}
      </form>
    </Form>
  );
}
