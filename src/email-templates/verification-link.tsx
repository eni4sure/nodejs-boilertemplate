import { Html, Text, Button, Heading, Container } from "@react-email/components";

interface EmailProp {
    firstName: string;
    verificationLink: string;
}

export default function Email({ firstName, verificationLink }: EmailProp) {
    return (
        <Html lang="en">
            <Container>
                <Heading as="h2">Verify your Email</Heading>

                <Text>Hi {firstName},</Text>

                <Text>Click the button below to verfiy your account.</Text>

                <Button href={verificationLink}>Verify Email</Button>

                <Text>Thanks!</Text>
            </Container>
        </Html>
    );
}
