import { BRAND_NAME } from "@/lib/legal/constants";
import { emailStyles } from "@/lib/email/styles/email-styles";

export function EmailHeader() {
  return (
    <tr>
      <td className="email-header" style={emailStyles.header}>
        <p className="email-brand" style={emailStyles.brand}>
          {BRAND_NAME}
        </p>
      </td>
    </tr>
  );
}
