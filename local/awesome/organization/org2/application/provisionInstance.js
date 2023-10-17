const OSWrap = require('openstack-wrapper');

// disable strict SSL for development purpose. This HAS to be changed in a production environment.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

// please modify/change the values according to your Openstack login and connection details
OSWrap.getSimpleProject('admin', 'XBmhca6H6VVvPQhviTigq7SZE35gLCuE', 'b80cf0fac3734a49920d3502b742a468', 'https://62.195.55.145:5000/v3/', function(err, project) {
  if (err) {
    console.error("Error occurred:", err.message);
    console.error("1");
  } else {

    // Define server details
    let data_object = {
      "server": {
        "name": "test2", // the new should be changed after each creation. Except when instance is deleted
        "imageRef": "0525f44b-aaeb-4acd-bade-cee56d3449c0", 
        "flavorRef": "1", 
        "networks": [
          {
            "uuid": "8e1585a8-fdac-4296-82bf-b46a0e0ea96c" 
          }
        ],
        "security_groups": [
          {
            "name": "default"
          }
        ],
        "key_name": "cirrosSSH" // use an already created ssh key
      }
    };


    // Create the server
    console.log("Starting instance creation.")
    project.nova.createServer(data_object, function(err, response) {
      console.log(1);
      if (err) {
        console.log(99);
        console.error("Error occurred:", err.message);
        console.error(err.stack);
      } else {
        console.log(2);
        let server_id = response.id;
        console.log("Creating new floating ip...");
        // define properties for floatin ip
        let floating_ip_data_object = {
          "pool": "external"
        };
        // create a new floating ip to associate to the newly created instance
        project.nova.createFloatingIp(floating_ip_data_object, function(err, floatingIpResponse) {
          if (err) {
            console.log(err);
          } else {
            console.log(floatingIpResponse.ip);
            let newFloatingIp = floatingIpResponse.ip;
            let serverId = server_id; // replace with the id of the newly created server

            // Wait 10 seconds before associating the floating IP
            setTimeout(function() {
              project.nova.associateFloatingIp(serverId, newFloatingIp, function(err, response) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Successfully associated floating ip to instance.");
                  console.log("Instance creation ended.");
                }
              });
            }, 10000);
          }
        });

      }
    });
  }
});



