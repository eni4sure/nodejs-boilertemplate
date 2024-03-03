import V1EmailLayout from "@/email-templates/layouts/v1-layout";
import { Text, Button, Heading, Section } from "@react-email/components";

interface EmailProp {
    firstName: string;
    verificationLink: string;
}

export default function Email({ firstName, verificationLink }: EmailProp) {
    return (
        <V1EmailLayout>
            <Section className="bg-white py-10 px-2 md:px-10">
                <Heading as="h2" className="text-xl font-bold">
                    Hi {firstName || "there"},
                </Heading>

                <Text className="text-lg font-normal">Excited to have you on board!</Text>

                <Text className="text-lg font-normal">Please click the button below to verify your email address.</Text>

                <Button className="px-5 py-2.5 bg-black rounded text-lg font-normal text-white" href={verificationLink}>
                    Verify Email
                </Button>

                <Text className="text-lg font-normal">
                    Thanks!
                    <br />
                    <b>nodejs-boilertemplate team</b>
                </Text>
            </Section>
        </V1EmailLayout>
    );
}
