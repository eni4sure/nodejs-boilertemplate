import { CONFIGS } from "@/configs";
import { DefaultLayout } from "./components";
import { Text, Button, Heading, Section } from "@react-email/components";

interface EmailProp {
    firstName: string;
    resetLink: string;
}

export default function Email({ firstName, resetLink }: EmailProp) {
    return (
        <DefaultLayout>
            <Section style={{ padding: "16px 16px 0px 16px" }}>
                <Heading as="h3">Reset Password</Heading>

                <Text>Hi {firstName}, ⚡️</Text>

                <Text>
                    Click the link below to reset your password. This link expires in <b>{(Number(CONFIGS.TOKEN_EXPIRY_DURATION) / 60).toFixed(0)} minutes.</b>
                </Text>

                <Button href={resetLink}>Reset your password</Button>

                <Text>Thanks!</Text>
            </Section>
        </DefaultLayout>
    );
}
