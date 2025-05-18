import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFormContext } from "@/contexts/FormContext";
import { AgeGroup, ChildProfile, HealthCondition, UserProfile } from "@/contexts/FormContext";
import { healthConditionsList } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { nanoid } from "nanoid";
import { User, UserPlus, Baby, CalendarIcon, Plus, Pencil, Check, Trash2, AlertTriangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function UserProfileManager() {
  const { 
    userProfile, 
    updateUserProfile, 
    activeChildId, 
    setActiveChildId 
  } = useFormContext();
  
  // For parent profile
  const [isEditingParent, setIsEditingParent] = useState(false);
  const [parentName, setParentName] = useState(userProfile?.name || "");
  const [parentEmail, setParentEmail] = useState(userProfile?.email || "");
  
  // For child profiles
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  
  // Child form state
  const [childName, setChildName] = useState("");
  const [childAgeGroup, setChildAgeGroup] = useState<AgeGroup>("0-2");
  const [childHealthConditions, setChildHealthConditions] = useState<HealthCondition[]>([]);
  const [childDateOfBirth, setChildDateOfBirth] = useState<Date | undefined>(undefined);
  
  const handleSaveParentProfile = () => {
    if (!parentName.trim()) return;
    
    const profile: UserProfile = {
      name: parentName.trim(),
      email: parentEmail.trim() || undefined,
      children: userProfile?.children || []
    };
    
    updateUserProfile(profile);
    setIsEditingParent(false);
  };
  
  const handleAddChild = () => {
    if (!childName.trim()) return;
    
    const newChild: ChildProfile = {
      id: nanoid(),
      name: childName.trim(),
      ageGroup: childAgeGroup,
      healthConditions: childHealthConditions,
      dateOfBirth: childDateOfBirth ? format(childDateOfBirth, 'yyyy-MM-dd') : undefined
    };
    
    const updatedProfile: UserProfile = {
      ...userProfile!,
      children: [...(userProfile?.children || []), newChild]
    };
    
    updateUserProfile(updatedProfile);
    resetChildForm();
    setIsAddingChild(false);
    
    // If this is the first child, set it as active
    if (!userProfile?.children.length) {
      setActiveChildId(newChild.id);
    }
  };
  
  const handleUpdateChild = (updatedChild: ChildProfile) => {
    if (!userProfile) return;
    
    const updatedChildren = userProfile.children.map(child =>
      child.id === updatedChild.id ? updatedChild : child
    );
    
    updateUserProfile({
      ...userProfile,
      children: updatedChildren
    });
    
    resetChildForm();
    setEditingChildId(null);
  };
  
  const handleRemoveChild = (childId: string) => {
    if (!userProfile) return;
    
    const updatedChildren = userProfile.children.filter(child => child.id !== childId);
    
    updateUserProfile({
      ...userProfile,
      children: updatedChildren
    });
    
    // If removing the active child, set another as active if available
    if (activeChildId === childId && updatedChildren.length > 0) {
      setActiveChildId(updatedChildren[0].id);
    } else if (updatedChildren.length === 0) {
      setActiveChildId(null);
    }
  };
  
  const toggleCondition = (condition: { id: string; name: string }) => {
    const exists = childHealthConditions.some(c => c.id === condition.id);
    
    if (exists) {
      setChildHealthConditions(childHealthConditions.filter(c => c.id !== condition.id));
    } else {
      setChildHealthConditions([...childHealthConditions, condition]);
    }
  };
  
  const handleEditChild = (child: ChildProfile) => {
    setChildName(child.name);
    setChildAgeGroup(child.ageGroup);
    setChildHealthConditions(child.healthConditions);
    setChildDateOfBirth(child.dateOfBirth ? new Date(child.dateOfBirth) : undefined);
    setEditingChildId(child.id);
  };
  
  const resetChildForm = () => {
    setChildName("");
    setChildAgeGroup("0-2");
    setChildHealthConditions([]);
    setChildDateOfBirth(undefined);
  };
  
  const handleSetActiveChild = (childId: string) => {
    setActiveChildId(childId);
  };
  
  const getChildAgeText = (ageGroup: AgeGroup) => {
    switch (ageGroup) {
      case "0-2": return "Infant/Toddler (0-2 years)";
      case "3-6": return "Preschooler (3-6 years)";
      case "7-10": return "School Age (7-10 years)";
      default: return "Toddler";
    }
  };
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Parent Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Parent Profile
          </CardTitle>
          <CardDescription>
            Manage your primary account information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditingParent ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="parent-name">Your Name</Label>
                <Input 
                  id="parent-name" 
                  value={parentName} 
                  onChange={(e) => setParentName(e.target.value)} 
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label htmlFor="parent-email">Email (Optional)</Label>
                <Input 
                  id="parent-email" 
                  type="email" 
                  value={parentEmail} 
                  onChange={(e) => setParentEmail(e.target.value)} 
                  placeholder="Enter your email address"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{userProfile?.name || "Not set"}</p>
                  <p className="text-sm text-gray-500">{userProfile?.email || "No email provided"}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditingParent(true)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        {isEditingParent && (
          <CardFooter className="flex justify-end space-x-2 bg-gray-50 border-t px-6 py-4">
            <Button variant="outline" onClick={() => setIsEditingParent(false)}>Cancel</Button>
            <Button onClick={handleSaveParentProfile}>Save Changes</Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Children Profiles */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Baby className="mr-2 h-5 w-5" />
            Child Profiles
          </h2>
          <Dialog open={isAddingChild} onOpenChange={setIsAddingChild}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  resetChildForm();
                  setIsAddingChild(true);
                }}
              >
                <UserPlus className="h-4 w-4" />
                Add Child
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Child</DialogTitle>
                <DialogDescription>
                  Create a profile for your child to get personalized food recommendations
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="child-name">Child's Name</Label>
                  <Input 
                    id="child-name" 
                    value={childName} 
                    onChange={(e) => setChildName(e.target.value)} 
                    placeholder="Enter child's name"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="age-group">Age Group</Label>
                    <Select 
                      value={childAgeGroup} 
                      onValueChange={(value) => setChildAgeGroup(value as AgeGroup)}
                    >
                      <SelectTrigger id="age-group">
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-2">Infant/Toddler (0-2 years)</SelectItem>
                        <SelectItem value="3-6">Preschooler (3-6 years)</SelectItem>
                        <SelectItem value="7-10">School Age (7-10 years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="date-of-birth">Date of Birth (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !childDateOfBirth && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {childDateOfBirth ? format(childDateOfBirth, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={childDateOfBirth}
                          onSelect={setChildDateOfBirth}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <Label>Health Conditions</Label>
                  <div className="border rounded-md p-4 mt-1.5 h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {healthConditionsList.map((condition) => {
                        const isSelected = childHealthConditions.some(c => c.id === condition.id);
                        return (
                          <Button
                            key={condition.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className="mr-2 mb-2"
                            onClick={() => toggleCondition(condition)}
                          >
                            {condition.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Select all health conditions that apply to this child
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingChild(false)}>Cancel</Button>
                <Button onClick={handleAddChild} disabled={!childName.trim()}>
                  Add Child Profile
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {(!userProfile?.children || userProfile.children.length === 0) ? (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-center py-12">
              <div className="bg-white p-3 rounded-full mb-4">
                <Baby className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Child Profiles Yet</h3>
              <p className="text-gray-500 max-w-sm mb-4">
                Add your child's profile to get personalized food recommendations based on their age and health needs
              </p>
              <Button 
                onClick={() => {
                  resetChildForm();
                  setIsAddingChild(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add First Child
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userProfile.children.map((child) => (
              <Card 
                key={child.id}
                className={cn(
                  "transition-all",
                  child.id === activeChildId && "border-primary-500 shadow-md"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <CardTitle className="text-lg">
                        {child.name}
                      </CardTitle>
                      {child.id === activeChildId && (
                        <Badge className="ml-2 bg-primary-100 text-primary-800 hover:bg-primary-200">
                          <Check className="h-3 w-3 mr-1" /> Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditChild(child)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveChild(child.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <span>{getChildAgeText(child.ageGroup)}</span>
                    {child.dateOfBirth && (
                      <>
                        <span>•</span>
                        <span>Born: {format(new Date(child.dateOfBirth), "PP")}</span>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {child.healthConditions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Health considerations:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {child.healthConditions.map((condition) => (
                          <Badge key={condition.id} variant="outline">
                            {condition.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-700 bg-yellow-50 p-2 rounded-md text-sm">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      No health conditions specified
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-gray-50 border-t py-3 px-6">
                  {child.id !== activeChildId ? (
                    <Button 
                      onClick={() => handleSetActiveChild(child.id)}
                      variant="outline"
                      className="text-primary-600 border-primary-200"
                      size="sm"
                    >
                      Set as Active Child
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Recommendations will be personalized for {child.name}
                    </p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Edit Child Dialog */}
        {editingChildId && (
          <Dialog open={!!editingChildId} onOpenChange={(open) => !open && setEditingChildId(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Child Profile</DialogTitle>
                <DialogDescription>
                  Update your child's profile information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-child-name">Child's Name</Label>
                  <Input 
                    id="edit-child-name" 
                    value={childName} 
                    onChange={(e) => setChildName(e.target.value)} 
                    placeholder="Enter child's name"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-age-group">Age Group</Label>
                    <Select 
                      value={childAgeGroup} 
                      onValueChange={(value) => setChildAgeGroup(value as AgeGroup)}
                    >
                      <SelectTrigger id="edit-age-group">
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-2">Infant/Toddler (0-2 years)</SelectItem>
                        <SelectItem value="3-6">Preschooler (3-6 years)</SelectItem>
                        <SelectItem value="7-10">School Age (7-10 years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-date-of-birth">Date of Birth (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !childDateOfBirth && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {childDateOfBirth ? format(childDateOfBirth, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={childDateOfBirth}
                          onSelect={setChildDateOfBirth}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <Label>Health Conditions</Label>
                  <div className="border rounded-md p-4 mt-1.5 h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {healthConditionsList.map((condition) => {
                        const isSelected = childHealthConditions.some(c => c.id === condition.id);
                        return (
                          <Button
                            key={condition.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className="mr-2 mb-2"
                            onClick={() => toggleCondition(condition)}
                          >
                            {condition.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingChildId(null)}>Cancel</Button>
                <Button 
                  onClick={() => {
                    const child = userProfile?.children.find(c => c.id === editingChildId);
                    if (child) {
                      const updatedChild: ChildProfile = {
                        ...child,
                        name: childName.trim(),
                        ageGroup: childAgeGroup,
                        healthConditions: childHealthConditions,
                        dateOfBirth: childDateOfBirth ? format(childDateOfBirth, 'yyyy-MM-dd') : undefined
                      };
                      handleUpdateChild(updatedChild);
                    }
                  }} 
                  disabled={!childName.trim()}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}