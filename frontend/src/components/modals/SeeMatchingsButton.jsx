import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { useGetGroupsQuery } from '../../features/groups/groupsApiSlice';
import { useGetAllProjectsQuery } from '../../features/projects/projectsApiSlice';
import { PulseLoader } from 'react-spinners';
import MatchingCard from '../MatchingCard';
import Autocomplete from '@mui/material/Autocomplete';
import { useAssignGroupsProjectsMutation, useClearProjectAssignmentsMutation, useGetMatchingSuggestionsQuery } from '../../features/courses/coursesApiSlice';
import { Snackbar } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  border: '2px solid #000',
  boxShadow: 24,
  backgroundColor: "#6d6d6d",
  p: 4,
};

export default function SeeMatchingsButton({courseId}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [selectedMatchings, setSelectedMatchings] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    setMessage("");
  };
  
  const {
    data: groupData,
    isSuccess: isGroupsSuccess
  } = useGetGroupsQuery();

  const {
    data: projectsData,
    isSuccess: isGetProjectsSuccess
  } = useGetAllProjectsQuery();

  const { data: matchings, isSuccess: isMatchingSuccess, isLoading: isMatchingLoading, isError: isMatchingError, error: matchingError} = useGetMatchingSuggestionsQuery({courseId})

  const [assignGroupsProjects, {isSuccess: isSuccessAssignment, isLoading: isLoadingAssignment, isError: isErrorAssignment, error: errorAssignment}] = useAssignGroupsProjectsMutation();
  const [clearProjectAssignments, {isSuccess: isSuccessClear, isLoading: isLoadingClear, isError: isErrorClear, error: errorClear}] = useClearProjectAssignmentsMutation();
  React.useEffect(() => {
    if (isMatchingSuccess) {
      setSelectedMatchings(matchings);
    }
  }, [isMatchingSuccess])
  
  React.useEffect(() => {
    if (isSuccessAssignment) {
      setMessage("Successfully assigned groups to projects.")
      setSnackbarOpen(true);
    }
  }, [isSuccessAssignment])
  React.useEffect(() => {
   if (isErrorAssignment) {
      setMessage(errorAssignment.data.message)
      setSnackbarOpen(true);
    } 
  }, [isErrorAssignment])

  React.useEffect(() => {
    if (isSuccessClear) {
      setMessage("Successfully cleared project assignments from groups.")
      setSnackbarOpen(true);
    }
  }, [isSuccessClear])

  React.useEffect(() => {
   if (isErrorClear) {
      setMessage(errorClear.data.message)
      setSnackbarOpen(true);
    } 
  }, [isErrorClear])
  

  const handleSubmit = () => {
    assignGroupsProjects({matches: selectedMatchings})
  };

  const onSelectChange = (selectedProjectId, groupId) => {
    const newSelectMatchings = [...selectedMatchings].filter(obj => obj.groupId !== groupId)
    newSelectMatchings.push({
      projectId: selectedProjectId,
      groupId,
      score: -99
    });
    setSelectedMatchings(newSelectMatchings);
  }

  const handleClear = () => {
    clearProjectAssignments({courseId: courseId})
  };


  let objects;
  if (isGroupsSuccess && isGetProjectsSuccess) {
    const allProjects = projectsData.entities;
    const courseProjectIds = projectsData.ids.filter(id => allProjects[id].courseId == courseId)
    const courseGroupIds = groupData.ids.filter(id => groupData.entities[id].courseId == courseId)
    if (isMatchingLoading) {
      objects = <PulseLoader/>
    } else {
      objects = courseGroupIds.map((groupId, i) => {
        let obj = {groupId: groupId}
        if (isMatchingSuccess) {
          obj = matchings.find((match) => match.groupId === groupId);
        }

        return (
          <div key={i} className='card'>
            <MatchingCard matchObject={obj} allProjects={projectsData.entities} allGroups={groupData.entities}/>
            <Autocomplete
              id="tags-standard"
              options={courseProjectIds}
              onChange={(event, value)=> onSelectChange(value, groupId)}
              getOptionLabel={(projId) =>
                allProjects[projId].name
              }
              renderOption={(props, option ) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    {allProjects[option].name}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  onChange={onSelectChange}
                  variant="standard"
                  label={`${isMatchingSuccess ? "Optional: ": ""} Select a project`}
                  sx={{ backgroundColor: "lightGrey", width: "400px" , borderRadius: "5px"}}
                />
              )}
            />
          </div>
        )
      })
    }
  } 


  return (
    <div>
      <Button variant="contained" onClick={handleOpen}>Match Groups to a Project</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
      >
        <Box sx={style}>
          <div className='card__display-box'>
            <div className='card__title'>
              Assign groups to a project
            </div>
            {isMatchingError && <em>Unable to automatically match: {matchingError.data.message}</em>}
          </div>
          <div className='card__scroll-display-box'>
            {objects}
          </div>
          {!isLoadingAssignment && <button type='submit' onClick={handleSubmit}>Commit Group-Project Matching</button>}
          <button className="button--primary" onClick={handleClear}>Clear Assigned Projects Of All Groups</button>
        </Box>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message={message}
      />
    </div>
  );
}