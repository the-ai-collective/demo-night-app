import { type CreateEmailResponse, Resend } from "resend";
import { env } from "~/env";

const resend = new Resend(env.RESEND_API_KEY);

type EmailTemplate =
  "demo-submission-received" |
  "demo-submission-accepted" |
  "demo-submission-rejected";

type EmailSendProps = {
  to: string,
  template: EmailTemplate,
}

type TemplateProps = {
  personName: string,
  startupName: string,
}

export const sendEmail = async (
  { to, template }: EmailSendProps,
  { personName, startupName }: TemplateProps
): Promise<CreateEmailResponse> => {
  return resend.emails.send({
    to,
    template: {
      id: template,
      variables: {
        NAME: personName,
        STARTUP_NAME: startupName,
      }
    }
  });
}
