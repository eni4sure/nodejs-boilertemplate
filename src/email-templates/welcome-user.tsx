import { Html, Text, Button, Heading, Container } from "@react-email/components";

interface EmailProp {
    firstName: string;
    verificationLink: string;
}

export default function Email({ firstName, verificationLink }: EmailProp) {
    return (
        <Html lang="en">
            <Container>
                <Heading as="h2">Hi {firstName}, ⚡️</Heading>

                <Text>We're really excited to have you on board.</Text>

                <Text>We need you to verify the email address you used in signing up. We'll be sending notifications, tips and updates to this email address. Please click the button below to verify.</Text>

                <Button href={verificationLink}>Verify Email</Button>

                <Text>Thanks!</Text>
            </Container>
        </Html>
    );
}
