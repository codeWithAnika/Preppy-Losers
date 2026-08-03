"use client";

import { useState } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import {
  createCustomerAddressAction,
  deleteCustomerAddressAction,
  setDefaultCustomerAddressAction,
  updateCustomerAddressAction,
} from "@/lib/customer-addresses.actions";
import {
  formatAddressOneLine,
  toAddressInput,
  type CustomerAddress,
  type CustomerAddressInput,
} from "@/lib/customer-addresses";

const emptyForm: CustomerAddressInput = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

interface AddressManagerProps {
  initialAddresses: CustomerAddress[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(initialAddresses.length === 0);
  const [form, setForm] = useState<CustomerAddressInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const startAdd = () => {
    setForm({ ...emptyForm, isDefault: addresses.length === 0 });
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const startEdit = (address: CustomerAddress) => {
    setForm(toAddressInput(address));
    setEditingId(address.id);
    setShowForm(true);
    setError(null);
  };

  const updateField = (field: keyof CustomerAddressInput, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const result = editingId
      ? await updateCustomerAddressAction(editingId, form)
      : await createCustomerAddressAction(form);

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    setLoading(true);
    const result = await deleteCustomerAddressAction(id);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAddresses((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    setLoading(true);
    const result = await setDefaultCustomerAddressAction(id);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAddresses((prev) =>
      prev.map((entry) => ({ ...entry, isDefault: entry.id === id }))
    );
  };

  return (
    <div className="space-y-6">
      {addresses.length > 0 && (
        <ul className="space-y-4">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="border border-white/10 bg-white/[0.02] p-4 md:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-foreground">
                    {address.fullName}
                    {address.isDefault && (
                      <span className="ml-2 text-[0.65rem] uppercase tracking-[0.2em] text-accent">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {formatAddressOneLine(address)}
                  </p>
                  <p className="mt-1 text-xs text-muted">{address.phone}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!address.isDefault && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSetDefault(address.id)}
                      className="border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => startEdit(address)}
                    className="border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleDelete(address.id)}
                    className="border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-accent"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!showForm ? (
        <MagneticGlitchButton type="button" variant="outline" onClick={startAdd}>
          Add new address
        </MagneticGlitchButton>
      ) : (
        <div className="border border-white/10 bg-white/[0.02] p-5 md:p-6">
          <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-muted">
            {editingId ? "Edit address" : "New address"}
          </h3>
          <div className="space-y-4">
            <AuthField
              label="Full name"
              required
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
            <AuthField
              label="Address line 1"
              required
              value={form.line1}
              onChange={(e) => updateField("line1", e.target.value)}
            />
            <AuthField
              label="Address line 2"
              value={form.line2 ?? ""}
              onChange={(e) => updateField("line2", e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label="City"
                required
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
              <AuthField
                label="State"
                required
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label="Pincode"
                required
                value={form.pincode}
                onChange={(e) => updateField("pincode", e.target.value)}
                inputMode="numeric"
                pattern="\d{6}"
              />
              <AuthField
                label="Phone"
                required
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={form.isDefault ?? false}
                onChange={(e) => updateField("isDefault", e.target.checked)}
                className="accent-accent"
              />
              Set as default delivery address
            </label>
          </div>
          {error && (
            <p className="mt-4 text-xs text-accent" role="alert">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <MagneticGlitchButton
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Saving..." : editingId ? "Update address" : "Save address"}
            </MagneticGlitchButton>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
