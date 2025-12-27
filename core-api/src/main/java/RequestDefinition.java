public class RequestDefinition {
    private final String name;
    private final String rawContent;

    public RequestDefinition(String name, String rawContent) {
        this.name = name;
        this.rawContent = rawContent;
    }

    public String getName() {
        return name;
    }

    public String getRawContent() {
        return rawContent;
    }
}
