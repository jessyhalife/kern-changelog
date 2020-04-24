import React, { Component} from "react";
import project from "../controllers/projects";
import {
  Button,
  Row,
  Col,
  Container,
  Card,
  Table,
  Form,
  Spinner,
  Dropdown,
} from "react-bootstrap";
import DateTimePicker from "react-datetime-picker";

const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);

class Projects extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  state = {
    projects: [],
    changes: [],
    selectedProjectId: undefined,
    filtered: [],
    search: "",
    isLoading: false,
    hasError: false,
    error: "",
    pages: [],
    showDetails: true,
    fechaDesde: new Date(),
    fechaHasta: new Date(),
    branches: [],
    selBranch: undefined,
  };
  filtrarPorFecha = () => {
    var filtradas = this.state.changes.filter((x) => {
      var fecha = new Date(x.created_at);
      return fecha >= this.state.fechaDesde && fecha <= this.state.fechaHasta;
    });

    this.setState({ filtered: filtradas });
  };
  executeScroll = () => scrollToRef(this.myRef);
  exctractInfo = async (data) => {
    data = data.map((x) => {
      var reg = /\[Ticket\]\:(\ *#*\w*)/;
      var arr = x.description.match(reg);
      if (arr && arr.length > 1) x.ticket = arr[1];
      reg = /(\[Ejecutables\]:)([\ |\w|\.]*)/;
      arr = x.description.match(reg);
      if (arr && arr.length > 2) x.ejecutables = arr[2];
      reg = /(\[Descripcion\]:)(.*)/;
      arr = x.description.match(reg);
      if (arr && arr.length > 2) x.descripcion_usr = arr[2];

      reg = /(\[SP\]:)(.*)/;
      arr = x.description.match(reg);
      if (arr && arr.length > 2) x.stored_procedures = arr[2];

      reg = /(\[Configuracion\]:)(.*)/;
      arr = x.description.match(reg);
      if (arr && arr.length > 2) x.configuraciones = arr[2];

      return x;
    });
    this.setState({ changes: data, filtered: data, isLoading: false });
  };

  setPages(pages) {
    let list = [];
    let p = pages.split(",");
    p.forEach((x) => {
      let aux = x.split(";");
      //first: 0
      //prev: 1
      //next: 2
      //last: 3
      if (aux[1].split("=")[1].replace('"', "").replace('"', "") === "first")
        list.push({
          id: 0,
          url: aux[0].replace('"', "").replace("<", "").replace(">", ""),
        });
      if (aux[1].split("=")[1].replace('"', "").replace('"', "") === "prev")
        list.push({
          id: 1,
          url: aux[0].replace('"', "").replace("<", "").replace(">", ""),
        });
      if (aux[1].split("=")[1].replace('"', "").replace('"', "") === "next")
        list.push({
          id: 2,
          url: aux[0].replace('"', "").replace("<", "").replace(">", ""),
        });
      if (aux[1].split("=")[1].replace('"', "").replace('"', "") === "last")
        list.push({
          id: 3,
          url: aux[0].replace('"', "").replace("<", "").replace(">", ""),
        });
    });

    this.setState({
      pages: list.sort((a, b) => {
        return a.id - b.id;
      }),
    });
  }
  filter(text) {
    if (text === "" || !text) {
      this.setState({ search: "", filtered: this.state.changes });
      return;
    }
    this.setState({ search: text }, () => {
      var filter = this.state.changes;
      filter = filter.filter((x) => {
        return (
          x.title.toUpperCase().includes(this.state.search.toUpperCase()) ||
          x.description.toUpperCase().includes(this.state.search.toUpperCase())
        );
      });
      console.log(filter);
      this.setState({ filtered: filter });
    });
  }
  componentDidMount() {
    this.getProjects(undefined);
  }
  getProjects() {
    project
      .getProjects()
      .then((data) => {
        this.setState({ projects: data.data });
      })
      .catch((err) => console.log(err));
  }
  loadBranches(id, url) {
    this.setState({ isLoading: true, selectedProjectId: id }, () => {
      project
        .getBranches(id, url)
        .then((data) => {
          this.setState({ branches: data.data.reverse(), isLoading: false });
          console.log(data.data);
        })
        .catch((err) => {
          console.log(err);
          this.setState({ isLoading: false, hasError: true, error: err });
        });
    });
  }
  loadProjectInfo(id, url, name, branchName) {
    if (id !== 12562383) {
      this.setState({ branches: [], selBranch: "" });
    }
    this.setState({ isLoading: true, selectedProjectId: id }, () => {
      project
        .getProjectInfo(id, url, name, branchName)
        .then((data) => {
          console.log(data);
          this.setPages(data.headers.link);
          this.exctractInfo(data.data).then(() => {});
          this.executeScroll();
        })
        .catch((err) => {
          console.log(err);
          this.setState({ isLoading: false, hasError: true, error: err });
        });
    });
  }
  render() {
    return (
      <div>
        <Container style={{ marginLeft: "10rem" }}>
          <h1>Proyectos</h1>
          <h6>
            Seleccione un proyecto para ver los cambios realizados por
            desarrollo
          </h6>
          <br></br>
          <Row>
            {this.state.projects.map((x) => (
              <Col style={{ padding: "2px" }} key={x.id}>
                <Card style={{ width: "14rem", height: "14rem" }}>
                  <Card.Body>
                    <Card.Title>{x.name}</Card.Title>
                    <Card.Text>
                      Ultima actualizacion:{" "}
                      {new Date(x.last_activity_at).toLocaleDateString()}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      variant="danger"
                      style={{ margin: "0.1rem" }}
                      onClick={() => {
                        if (x.id !== 12562383)
                          this.loadProjectInfo(x.id, undefined, x.name);
                        else this.loadBranches(x.id, undefined);
                      }}
                    >
                      Ver cambios
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
        <hr></hr>
        <div>
          <h1 ref={this.myRef}>
            {this.state.projects.length > 0 && this.state.selectedProjectId >= 0
              ? this.state.projects.find(
                  (x) => x.id === this.state.selectedProjectId
                ).name
              : undefined}
          </h1>
          {this.state.selBranch && this.state.selBranch !== "" ? (
            <div>
              <span
                style={{
                  fontSize: "0.2em !important",
                  backgroundColor: "yellow",
                }}
              >
                <i>{"(" + this.state.selBranch + ")"}</i>
              </span>
              <br></br>
              <br></br>
            </div>
          ) : undefined}

          {!this.state.isLoading && this.state.branches.length > 0 ? (
            <Dropdown>
              <Dropdown.Toggle
                variant="secondary"
                id="dropdown-basic"
                size="sm"
              >
                Seleccione un release
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {this.state.branches.map((x) => {
                  return (
                    <Dropdown.Item
                      key={x.commit.id}
                      onSelect={(evt) => {
                        this.setState({ selBranch: evt });
                        this.loadProjectInfo(
                          this.state.selectedProjectId,
                          undefined,
                          "",
                          evt
                        );
                      }}
                      eventKey={x.name}
                    >
                      {x.name}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          ) : undefined}
        </div>
        <br></br>
        {this.state.isLoading ? (
          <Spinner
            style={{ margin: "40px" }}
            animation="grow"
            variant="danger"
          />
        ) : this.state.changes.length > 0 ? (
          <Form>
            <Form.Group as={Row} controlId="searchInput">
              <Form.Label column sm={2}>
                Buscar
              </Form.Label>
              <Col sm={3}>
                <Form.Control
                  value={this.state.search}
                  onKeyPress={(event) => {
                    console.log(event.key);
                    if (event.key === "Enter") event.preventDefault();
                  }}
                  onChange={(event) => this.filter(event.target.value)}
                  type="text"
                  placeholder="Ingrese su busqueda"
                ></Form.Control>
              </Col>
              <Col sm={2}>
                <DateTimePicker
                  value={this.state.fechaDesde}
                  onChange={(date) => {
                    this.setState({ fechaDesde: date });
                  }}
                />
              </Col>
              <Col sm={2}>
                <DateTimePicker
                  value={this.state.fechaHasta}
                  onChange={(date) => {
                    this.setState({ fechaHasta: date });
                  }}
                />
              </Col>
              <Col sm={2}>
                <Button
                  onClick={() => {
                    this.filtrarPorFecha();
                  }}
                >
                  Filtrar por fecha
                </Button>
              </Col>
            </Form.Group>
            <Button variant="default" onClick={() => this.filter()}>
              X Limpiar filtros
            </Button>
          </Form>
        ) : undefined}
        <br></br>
        {this.state.filtered.length > 0 ? (
          <div>
            <Table size="x-sm" striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ticket</th>
                  <th>Ejecutables</th>
                  <th>Descripcion</th>
                  <th>SP</th>
                  <th>Configuraciones</th>
                  <th>Autor</th>
                </tr>
              </thead>
              <tbody>
                {this.state.filtered.map((x) => (
                  <tr key={x.id}>
                    <td>{new Date(x.created_at).toLocaleDateString()}</td>
                    <td>
                      {x.hasOwnProperty("ticket")
                        ? x.ticket.includes("#")
                          ? x.ticket.trim()
                          : "#" + x.ticket.trim()
                        : x.source_branch}
                    </td>
                    <td>
                      {x.hasOwnProperty("ejecutables") ? x.ejecutables : ""}
                    </td>
                    <td>
                      <b>{x.title}</b>
                      <br></br>
                      {x.hasOwnProperty("descripcion_usr")
                        ? x.descripcion_usr
                        : x.description}
                    </td>
                    <td>
                      {x.hasOwnProperty("stored_procedures")
                        ? x.stored_procedures
                        : "-"}
                    </td>
                    <td>
                      {x.hasOwnProperty("configuraciones")
                        ? x.configuraciones
                        : "-"}
                    </td>
                    <td>{x.author.name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* {this.state.pages.length > 0 ? 
            <Pagination>
              {this.state.pages.map(x => 
                {
                  
                  if (x.id === 0)
                    return <Pagination.First onClick={() => this.loadProjectInfo(undefined, x.url)}/>
                  if (x === 1)
                    return <Pagination.Prev  onClick={() => this.loadProjectInfo(undefined, x.url)}/>
                  else if (x === 2)
                    return <Pagination.Next onClick={() => this.loadProjectInfo(undefined, x.url)}/>
                  else
                    return <Pagination.Last onClick={() => this.loadProjectInfo(undefined, x.url)}/>
                })}
            </Pagination>
          : undefined} */}
          </div>
        ) : undefined}
      </div>
    );
  }
}

export default Projects;
