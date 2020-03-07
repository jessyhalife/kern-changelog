
import React, { Component } from 'react';
import project from '../controllers/projects';
import { Button, Row, Col, Container, Card, Table, Form, Spinner, Jumbotron, Pagination } from 'react-bootstrap';


class Projects extends Component {
  state = {
    projects: [],
    changes: [],
    selectedProjectId: undefined,
    filtered: [],
    search: '',
    isLoading: false,
    hasError: false,
    error: '',
    pages: [], 
    showDetails: true
  }
  setPages(pages) {
    let list = [];
    let p = pages.split(',');
    p.forEach(x => {
      let aux = x.split(';');
      //first: 0
      //prev: 1
      //next: 2
      //last: 3
      if (aux[1].split('=')[1].replace('"', '').replace('"', '') === 'first')
        list.push({ id: 0, url: aux[0].replace('"', '').replace('<', '').replace('>', '') });
      if (aux[1].split('=')[1].replace('"', '').replace('"', '') === 'prev')
        list.push({ id: 1, url: aux[0].replace('"', '').replace('<', '').replace('>', '') });
      if (aux[1].split('=')[1].replace('"', '').replace('"', '') === 'next')
        list.push({ id: 2, url: aux[0].replace('"', '').replace('<', '').replace('>', '') });
      if (aux[1].split('=')[1].replace('"', '').replace('"', '') === 'last')
        list.push({ id: 3, url: aux[0].replace('"', '').replace('<', '').replace('>', '') });
    }
    );

    this.setState({ pages: list.sort((a, b) => { return a.id - b.id }) });
  }
  filter(text) {
    console.log(text);
    if (text === '' || !text) {
      this.setState({ search: '', filtered: this.state.changes });
      return;
    }
    this.setState({ search: text }, () => {
      var filter = this.state.changes;
      filter = filter.filter(x => { return x.title.includes(this.state.search) || x.description.includes(this.state.search) });
      console.log(filter);
      this.setState({ filtered: filter });
    });
  }
  componentDidMount() {
    this.getProjects(undefined);
  }
  getProjects() {
    project.getProjects().then(data => {
      this.setState({ projects: data.data });
    }).catch(err => console.log(err))
  }

  loadProjectInfo(id, url, name) {
    this.setState({ isLoading: true, selectedProjectId: id }, () => {
      project.getProjectInfo(id, url, name).then(data => {
        this.setPages(data.headers.link);
        this.setState({ changes: data.data, filtered: data.data, isLoading: false });
      })
        .catch(err => { console.log(err); this.setState({ isLoading: false, hasError: true, error: err }) });
    })

  }
  render() {
    return (
      <div>
        <Container style={{marginLeft: "10rem"}}>
          <Row>
            {this.state.projects.map(x => <Col style={{ padding: "2px" }} key={x.id}>
              
              <Card  style={{ width: '14rem', height: '14rem' }}>
                <Card.Body>
                  <Card.Title>{x.name}</Card.Title>
                  <Card.Text>Ultima actualizacion:  {new Date(x.last_activity_at).toLocaleDateString()}</Card.Text>
                </Card.Body>
                <Card.Footer>
                <Button style={{margin: '0.1rem'}} onClick={() => { this.loadProjectInfo(x.id, undefined, x.name) }}>Ver cambios</Button>
                </Card.Footer>
              </Card>
            </Col>)}

          </Row>
        </Container>
        <hr></hr>
        <div><h1>
          {this.state.projects.length > 0 && this.state.selectedProjectId >= 0 ? (this.state.projects.find(x => x.id === this.state.selectedProjectId).name) : undefined}</h1></div>
        {this.state.isLoading ? <Spinner style={{ margin: "40px" }} animation="grow" variant="danger" />
          : <Form>
            <Form.Group as={Row} controlId="searchInput">
              <Form.Label column sm={2}>
                Buscar
         </Form.Label>
              <Col sm={3}>
                <Form.Control value={this.state.search} onChange={(event) => this.filter(event.target.value)} type="text" placeholder="Ingrese su busqueda"></Form.Control>
              </Col>
            </Form.Group>
          </Form>}
        {this.state.filtered.length > 0 ?
          <Jumbotron>
            <Table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ticket</th>
                  <th>Cambios</th>
                  <th>Autor</th>
                </tr>
              </thead>
              <tbody>
                {this.state.filtered.map(x => (
                  <tr key={x.id}>
                    <td>{new Date(x.created_at).toLocaleDateString()}</td>
                    <td>{x.source_branch}</td>
                    <td><b>{x.title}</b><br></br>{x.description}</td>
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

          </Jumbotron>
          : undefined}


      </div>
    );
  }
}

export default Projects;