import React from "react";

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type,
  style,
  disabled,
  required,
  error,
}) {
  return (
    <div className={style}>
      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
        {label} {required ? <span className="text-meta-1">*</span> : ""}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        disabled={disabled}
      />
      {error && (
        <p className="text-meta-1 mt-2">
          <span className="text-meta-1">*</span> Required {label}
        </p>
      )}
    </div>
  );
}

export default InputField;
