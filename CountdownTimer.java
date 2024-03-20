import static spark.Spark.*;

public class Main {
    public static void main(String[] args) {
        // Define routes
        get("/hello", (req, res) -> "Hello World");

        // Example of handling form submission
        post("/submit-form", (req, res) -> {
            String data = req.queryParams("data");
            // Process the form data here
            return "Form submitted: " + data;
        });
    }
}
