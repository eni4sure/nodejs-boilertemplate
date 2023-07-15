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
                <Heading as="h3">Verify your Email</Heading>

                <Text>Hi {firstName},</Text>

                <Text>Click the link below to verfiy your account.</Text>

                <Button href={verificationLink}>Verify Email</Button>

                <Text>Thanks!</Text>
            </Section>
        </DefaultLayout>
    );
}
