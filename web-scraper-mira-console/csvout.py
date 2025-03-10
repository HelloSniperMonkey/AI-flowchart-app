import csv

def string_to_csv(input_string, output_file):
    """
    Convert a string into a CSV file where each line in the string becomes a new row.

    :param input_string: The input string with lines separated by '\n'.
    :param output_file: The name of the output CSV file.
    """
    # Split the string into lines
    lines = input_string.splitlines()

    # Write the lines into a CSV file
    with open(output_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        for line in lines:
            writer.writerow([line])  # Write each line as a single column

    print(f"CSV file '{output_file}' created successfully!")

# Example usage
input_string = """https://console.mira.network/flows/karoly/human-like-chat-bot/0.0.4
https://console.mira.network/flows/venmus/rap-song-generator/0.0.2
https://console.mira.network/flows/jaymalladi/mood-analysis-chatbot/1.1.1
https://console.mira.network/flows/anand/clothing-suggestion-generator/1.0.0
https://console.mira.network/flows/cosmic-labs/ai-astrologer/1.0.0
https://console.mira.network/flows/super-labs/blog-post-generator/1.0.3
https://console.mira.network/flows/rishi/cropwise-ai/0.0.2
https://console.mira.network/flows/anand/twitter-content-generator/1.0.1
https://console.mira.network/flows/shivam/Movie%20Recommendation%20System/0.0.3
https://console.mira.network/flows/satya/elemental-flow-generator/1.0.2
https://console.mira.network/flows/swapnilsaysloud/Tell%20Me%20More/0.0.1
https://console.mira.network/flows/venmus/mira-qna/0.0.2
https://console.mira.network/flows/jaymalladi/mindfulness-guide/1.0.3
https://console.mira.network/flows/sasmit/rap-song-generator/0.0.2
https://console.mira.network/flows/sahasrakruthi/recipe%20generator/0.1.11
https://console.mira.network/flows/flamekaiser/karan-mira-clone/0.0.2
https://console.mira.network/flows/cosmic-labs/professional-email-writer/0.1.0
https://console.mira.network/flows/satya/gpt-chat/0.0.1
https://console.mira.network/flows/shaswat-suman/holiday-planner/0.0.1
https://console.mira.network/flows/prasad178/Investor%20Magnet/0.0.5
https://console.mira.network/flows/anand/twitter-clone-workflow-generator/1.0.0
https://console.mira.network/flows/cosmic-labs/personal-budget-optimizer/1.0.0
https://console.mira.network/flows/satya/flow-generator/1.0.1
https://console.mira.network/flows/anand/startup-guidelines-generator/1.0.1
https://console.mira.network/flows/shaswat-suman/travel%20guide/0.0.1
https://console.mira.network/flows/sarthak-p/college-essay-generator/1.0.4
https://console.mira.network/flows/swapnilsaysloud/Chat%20With%20Me/0.0.1
https://console.mira.network/flows/sarim/alexandre-dumas-impersonator/0.1.1
https://console.mira.network/flows/venmus/polygon-stack/0.0.1
https://console.mira.network/flows/nimmagaddakumudahasini/Gift-Curator/1.0.0
https://console.mira.network/flows/shivam/ReadNext%20(Book%20Recommendation%20System)/0.0.1
https://console.mira.network/flows/anand/life-pathway-roadmap-generator/1.0.0
https://console.mira.network/flows/varunkumar0x10/Poetry%20Generator/0.0.1
https://console.mira.network/flows/shresth/Chuttiyaa_helper/0.0.2
https://console.mira.network/flows/flamekaiser/smart-contract-deployment-guide/0.0.1
https://console.mira.network/flows/sarim/product-review-analyzer/0.1.2
https://console.mira.network/flows/wafflebytes/rap-song-generator/0.0.2
https://console.mira.network/flows/shresth/Code-Helper/0.0.2
https://console.mira.network/flows/bossdad/mermaid%20code%20generator/0.0.2
https://console.mira.network/flows/crazy-dev/Stream_Your_Favorites/0.0.2
https://console.mira.network/flows/venkatesh-mira/diet-plan-generator/0.0.1
https://console.mira.network/flows/cosmic-labs/product-description-generator/1.0.0
https://console.mira.network/flows/cosmic-labs/resume-analyser/1.0.0
https://console.mira.network/flows/cosmic-labs/django-coding-assistant/1.0.0
https://console.mira.network/flows/cosmic-labs/recipe-remixer/1.0.3
https://console.mira.network/flows/prasad178/email-assistant/0.1.1
https://console.mira.network/flows/sarim/alexandre-dumas-twitter/0.1.1
https://console.mira.network/flows/anand/puzzle-riddle-generator/1.0.0
https://console.mira.network/flows/cosmic-labs/advanced-rap-creator/0.1.1
https://console.mira.network/flows/bossdad/prompt%20to%20bullet%20points/0.0.1
https://console.mira.network/flows/pranjal/rap-song-generator/0.0.1
https://console.mira.network/flows/cosmic-labs/portfolio-risk-analyzer/1.0.0
https://console.mira.network/flows/cosmic-labs/loan-repayment-strategist/1.0.0
https://console.mira.network/flows/cosmic-labs/stock-fundamental-analyzer/1.0.0
https://console.mira.network/flows/cosmic-labs/retirement-planning-calculator/1.0.0
https://console.mira.network/flows/shaswat-suman/song-generator/0.0.1
https://console.mira.network/flows/flugel/fact-checker/0.1.1
https://console.mira.network/flows/cosmic-labs/resume-achievement-writer/0.1.0
https://console.mira.network/flows/cosmic-labs/product-description-writer/0.1.0
https://console.mira.network/flows/cosmic-labs/technical-documentation-writer/0.1.0
https://console.mira.network/flows/rishi/CropWise%20AI/0.0.1
https://console.mira.network/flows/kashishrai/food-waste-management-system/1.0.0
https://console.mira.network/flows/shivam/medical-assistance-ai-flow/0.1.0"""

output_file = "output.csv"
string_to_csv(input_string, output_file)
