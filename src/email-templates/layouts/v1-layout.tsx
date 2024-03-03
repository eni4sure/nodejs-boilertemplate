import { Body, Preview, Container, Font, Head, Html, Tailwind } from "@react-email/components";

interface LayoutProp {
    preview?: string;
    children: React.ReactNode;
}

export default function V1EmailLayout({ preview, children }: LayoutProp) {
    return (
        <Html lang="en">
            <Tailwind config={{ theme: { extend: { colors: {} } }, darkMode: "class" }}>
                <Head>
                    <Font
                        // breaker
                        fontWeight={400}
                        fontStyle="normal"
                        fontFamily="Verdana"
                        fallbackFontFamily={["Verdana", "Helvetica"]}
                    />
                </Head>

                <>
                    {preview && <Preview>{preview}</Preview>}

                    <Body className="py-8 px-5 md:px-10">
                        <Container className="w-full max-w-2xl">
                            {/* Email content */}
                            {children}
                        </Container>
                    </Body>
                </>
            </Tailwind>
        </Html>
    );
}
