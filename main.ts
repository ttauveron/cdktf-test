import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { Container, Image, DockerProvider } from './.gen/providers/docker'
import { PostgresqlProvider, Role } from './.gen/providers/postgresql'
import { Sleep, TimeProvider } from './.gen/providers/time'


class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // Providers
    new DockerProvider(this, 'docker_provider', {})
    new TimeProvider(this, 'time_provider', {})

    // Variables
    let customers: { name: string, dbPassword: string }[] = [
      {"name": "dev-1", "dbPassword": "0FJzC6e9dBJbhsb2FVQTeMA732BN3SzM"},
      {"name": "dev-2", "dbPassword": "UUnU7Y1y9xetHiz7mMBmzsZ6KdD3HWjc"},
    ];
    const CONDITION = true

    // Resources
    const dockerImage = new Image(this, 'postgresImage', {
      name: 'postgres:latest',
      keepLocally: false,
    })

    let containers = Array<Container>()
    for (let i = 0; i < customers.length; i++) {
      containers.push(new Container(this, 'postgres-' + customers[i].name, {
          image: dockerImage.latest,
          name: 'postgres-' + customers[i].name,
          env: [
            "POSTGRES_PASSWORD=" + customers[i].dbPassword
          ],
          ports: [
            {
              internal: 5432,
              external: 5432 + i,
            },
          ],
        })
      )
    }

    if (CONDITION) {
      new Container(this, 'postgres-conditional', {
        image: dockerImage.latest,
        name: 'postgres-conditional',
        env: [
          "POSTGRES_PASSWORD=test"
        ],
      })
    }


    let sleep = new Sleep(this, 'wait_containers', {
      createDuration: "8s",
      dependsOn: containers
    });

    let postgresqlProviders = Array<PostgresqlProvider>()
    for (let i = 0; i < customers.length; i++) {
      postgresqlProviders.push(new PostgresqlProvider(this, "postgres-provider" + customers[i].name, {
        host: "localhost",
        port: 5432 + i,
        username: "postgres",
        password: customers[i].dbPassword,
        sslmode: "disable",
        alias: "postgres-" + customers[i].name
      }))
    }

    for (let i = 0; i < customers.length; i++) {
      new Role(this, "role-" + customers[i].name, {
        name: customers[i].name,
        login: true,
        password: customers[i].dbPassword,
        provider: postgresqlProviders[i],
        dependsOn: [sleep]
      })
    }

  }
}

const app = new App();
new MyStack(app, "cdktf-test");
app.synth();

