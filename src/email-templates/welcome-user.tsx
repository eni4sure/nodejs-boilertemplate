import DefaultLayout from "@/email-templates/layouts/default-layout";
import { Text, Button, Heading, Section } from "@react-email/components";

interface EmailProp {
    firstName: string;
    verificationLink: string;
}

export default function Email({ firstName, verificationLink }: EmailProp) {
    return (
        <DefaultLayout>
            <Section style={{ padding: "16px 16px 0px 16px" }}>
                <Heading as="h2">Hi {firstName}, ⚡️</Heading>

                <Text>We're really excited to have you on board.</Text>

                <Text>We need you to verify the email address you used in signing up. We'll be sending notifications, tips and updates to this email address. Please click the button below to verify.</Text>

                <Button href={verificationLink}>Verify Email</Button>

                <Text>Thanks!</Text>
            </Section>
        </DefaultLayout>
    );
}
