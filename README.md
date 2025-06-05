Job Ingestion API
What is this?
This is a small program that takes some job IDs you give it, puts them in groups, and processes them one by one based on how important they are (priority). You can also check later to see how your jobs are doing.

How does it work?
You send a list of job IDs and say if they are HIGH, MEDIUM, or LOW priority.

The program splits the list into small groups of 3 jobs each.

Every 5 seconds(As mentioned in the Assignment), it processes up to 3 jobs, starting with the most important ones.

You can ask the program what is the current status of your jobs.

What tools did I use?
Node.js (to run JavaScript on the server)

Express (to handle web requests)

UUID (to make unique IDs for each job request)

How to run this on your computer?
Download or clone the code from GitHub.

Open the folder in your terminal.

Run this command to install the tools the program needs:

nginx
Copy
Edit
npm install
Run this command to start the program:

nginx
Copy
Edit
node index.js
The program will run and listen on port 5000 (your computer address will be http://localhost:5000).

How to use the API (talk to the program)?
To add jobs (POST /ingest)
You send it a list of job IDs and a priority.

Example of what you send (JSON format):

json
Copy
Edit
{
  "ids": [1, 2, 3, 4, 5],
  "priority": "HIGH"
}
The priority can be HIGH, MEDIUM, or LOW. If you don’t say, it uses LOW by default.

The program will reply with a special ID (called ingestion_id). You use this ID to check the job status later.

To check jobs status (GET /status/:ingestion_id)
Just put in the ingestion_id you get from above post request
then you will be updated with the response Like
Example:

	 {
     "ingestion_id": "abc123",
       "status": "triggered",
  "batches": [
    	{"batch_id": <uuid>, "ids": [1, 2, 3], "status": "completed"},
{"batch_id": <uuid>, "ids": [4, 5], "status": "triggered"}
  ]
}


You use the ingestion_id you got earlier.

Example:

bash
Copy
Edit
GET /status/your-ingestion-id
The program replies with info about your jobs, like:

Overall status: done or still running

Smaller groups (batches) info — which jobs are done and which are still waiting.

