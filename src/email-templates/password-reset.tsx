import CONFIGS from "@/configs";
import { Html, Text, Button, Heading, Container } from "@react-email/components";

interface EmailProp {
    firstName: string;
    resetLink: string;
}

export default function Email({ firstName, resetLink }: EmailProp) {
    return (
        <Html lang="en">
            <Container>
                <Heading as="h2">Reset Password</Heading>

                <Text>Hi {firstName},</Text>

                <Text>
                    Click on the button below to reset your password. This link expires in <b>{(Number(CONFIGS.TOKEN_EXPIRY_DURATION) / 60).toFixed(0)} minutes.</b>
                </Text>

                <Button href={resetLink}>Reset your password</Button>

                <Text>Thanks!</Text>
            </Container>
        </Html>
    );
}
